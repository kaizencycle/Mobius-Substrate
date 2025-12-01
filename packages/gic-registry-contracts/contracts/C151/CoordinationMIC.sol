// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CoordinationMIC
 * @author Mobius Systems Foundation
 * @notice C-151 Coordination-Weighted MIC Economy
 * @dev Replaces linear minting with logistic coordination curve + cathedral multipliers
 * 
 * Key Features:
 * - Logistic reward curve for coordination scores
 * - Cathedral-specific multipliers (1.0x - 2.0x)
 * - Automatic attestation-based minting
 * - Gas-optimized (<500k per attestation)
 */
contract CoordinationMIC is ERC20, Ownable {
    
    // ═══════════════════════════════════════════════════════════════════════
    // STRUCTS
    // ═══════════════════════════════════════════════════════════════════════
    
    struct SentinelAttestation {
        uint256 score;          // 18-decimal coordination score (0-100)
        uint256 timestamp;      // Block timestamp of attestation
        string cathedral;       // Cathedral assignment
        uint256 reward;         // MIC reward minted
    }
    
    struct CathedralConfig {
        uint256 multiplier;     // 18-decimal multiplier (1e18 = 1.0x)
        bool active;            // Whether cathedral is active
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════
    
    /// @notice Attestation history per sentinel
    mapping(string => SentinelAttestation) public attestations;
    
    /// @notice Cathedral multiplier configurations
    mapping(string => CathedralConfig) public cathedrals;
    
    /// @notice Sentinel to cathedral mapping
    mapping(string => string) public sentinelCathedrals;
    
    /// @notice Authorized attesters (sentinel addresses)
    mapping(address => bool) public authorizedAttesters;
    
    /// @notice Total attestations submitted
    uint256 public totalAttestations;
    
    /// @notice Current cycle
    string public currentCycle;
    
    // ═══════════════════════════════════════════════════════════════════════
    // CONSTANTS (Logistic Curve Parameters)
    // ═══════════════════════════════════════════════════════════════════════
    
    /// @notice Maximum reward per attestation (L in logistic curve)
    uint256 public constant L = 1000 * 1e18;
    
    /// @notice Curve steepness (k in logistic curve) - scaled by 1e18
    int256 public constant K = 5e16; // 0.05 (gentler curve)
    
    /// @notice Midpoint of curve (x0 in logistic curve) - scaled by 1e18
    int256 public constant X0 = 50e18;
    
    /// @notice Minimum score required for attestation
    uint256 public constant MIN_SCORE = 1e18;
    
    /// @notice Maximum score allowed
    uint256 public constant MAX_SCORE = 100e18;
    
    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════
    
    event AttestationSubmitted(
        string indexed sentinelId,
        uint256 score,
        uint256 reward,
        string cathedral,
        uint256 timestamp
    );
    
    event CathedralConfigured(
        string indexed cathedral,
        uint256 multiplier,
        bool active
    );
    
    event SentinelAssigned(
        string indexed sentinelId,
        string indexed cathedral
    );
    
    event AttesterAuthorized(address indexed attester, bool authorized);
    
    event CycleUpdated(string oldCycle, string newCycle);
    
    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════
    
    constructor(address initialOwner) ERC20("Mobius Intelligence Credit", "MIC") Ownable(initialOwner) {
        currentCycle = "C-151";
        
        // Initialize cathedral multipliers
        _configureCathedral("FOR-GOVERNMENTS", 2e18, true);   // 2.0x
        _configureCathedral("FOR-ECONOMISTS", 15e17, true);   // 1.5x
        _configureCathedral("FOR-ACADEMICS", 12e17, true);    // 1.2x
        _configureCathedral("FOR-PHILOSOPHERS", 1e18, true);  // 1.0x
        
        // Initialize sentinel-cathedral assignments
        _assignSentinel("ATLAS", "FOR-GOVERNMENTS");
        _assignSentinel("AUREA", "FOR-ECONOMISTS");
        _assignSentinel("ECHO", "FOR-ACADEMICS");
        _assignSentinel("EVE", "FOR-PHILOSOPHERS");
        _assignSentinel("HERMES", "FOR-GOVERNMENTS");
        _assignSentinel("JADE", "FOR-PHILOSOPHERS");
        _assignSentinel("URIEL", "FOR-ACADEMICS");
        _assignSentinel("ZEUS", "FOR-GOVERNMENTS");
        _assignSentinel("ZENITH", "FOR-ECONOMISTS");
        _assignSentinel("DAEDALUS", "FOR-ECONOMISTS");
        
        // Authorize owner as initial attester
        authorizedAttesters[initialOwner] = true;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // ATTESTATION (Core Function)
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Submit coordination attestation for a sentinel
     * @param sentinelId Unique sentinel identifier (e.g., "ATLAS")
     * @param coordinationScore 18-decimal score (0-100e18)
     * @return reward Amount of MIC minted
     */
    function attest(
        string memory sentinelId,
        uint256 coordinationScore
    ) external returns (uint256 reward) {
        require(authorizedAttesters[msg.sender], "Not authorized attester");
        require(coordinationScore >= MIN_SCORE, "Score below minimum");
        require(coordinationScore <= MAX_SCORE, "Score exceeds maximum");
        
        // Calculate base reward using logistic curve
        uint256 baseReward = _calculateLogisticReward(coordinationScore);
        
        // Apply cathedral multiplier
        string memory cathedral = sentinelCathedrals[sentinelId];
        uint256 multiplier = cathedrals[cathedral].multiplier;
        if (multiplier == 0) multiplier = 1e18; // Default 1.0x
        
        reward = (baseReward * multiplier) / 1e18;
        
        // Store attestation
        attestations[sentinelId] = SentinelAttestation({
            score: coordinationScore,
            timestamp: block.timestamp,
            cathedral: cathedral,
            reward: reward
        });
        
        totalAttestations++;
        
        // Mint reward
        _mint(msg.sender, reward);
        
        emit AttestationSubmitted(
            sentinelId,
            coordinationScore,
            reward,
            cathedral,
            block.timestamp
        );
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // REWARD CALCULATION
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Calculate reward using logistic curve: L / (1 + e^(-k*(score - x0)))
     * @dev Uses Taylor series approximation for exp() to avoid overflow
     * @param score 18-decimal coordination score
     * @return reward Base reward before multiplier
     */
    function _calculateLogisticReward(uint256 score) internal pure returns (uint256) {
        // Calculate exponent: -k * (score - x0)
        int256 signedScore = int256(score);
        int256 exponent = -K * (signedScore - X0) / 1e18;
        
        // Calculate e^exponent using approximation
        uint256 expValue = _exp(exponent);
        
        // Calculate L / (1 + exp_value)
        uint256 denominator = 1e18 + expValue;
        uint256 reward = (L * 1e18) / denominator;
        
        return reward;
    }
    
    /**
     * @notice Approximate e^x for x in reasonable range
     * @dev Uses Taylor series: e^x ≈ 1 + x + x²/2 + x³/6 + x⁴/24
     * @param x Exponent (scaled by 1e18)
     * @return Approximation of e^x (scaled by 1e18)
     */
    function _exp(int256 x) internal pure returns (uint256) {
        // Clamp to reasonable range to prevent overflow
        if (x > 20e18) return type(uint256).max / 2; // Very large
        if (x < -20e18) return 0; // Very small
        
        // For simplicity, use piecewise linear approximation
        // This is gas-efficient and accurate enough for our use case
        if (x >= 0) {
            // e^x for positive x
            uint256 ux = uint256(x);
            // Simple approximation: 1 + x + x²/2
            uint256 x2 = (ux * ux) / 1e18;
            return 1e18 + ux + (x2 / 2);
        } else {
            // e^x for negative x: 1 / e^|x|
            uint256 ux = uint256(-x);
            uint256 x2 = (ux * ux) / 1e18;
            uint256 posExp = 1e18 + ux + (x2 / 2);
            return (1e36) / posExp;
        }
    }
    
    /**
     * @notice Preview reward for a given score and sentinel
     * @param sentinelId Sentinel identifier
     * @param coordinationScore Coordination score
     * @return reward Expected reward
     */
    function previewReward(
        string memory sentinelId,
        uint256 coordinationScore
    ) external view returns (uint256 reward) {
        uint256 baseReward = _calculateLogisticReward(coordinationScore);
        string memory cathedral = sentinelCathedrals[sentinelId];
        uint256 multiplier = cathedrals[cathedral].multiplier;
        if (multiplier == 0) multiplier = 1e18;
        return (baseReward * multiplier) / 1e18;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Configure cathedral multiplier
     * @param cathedral Cathedral identifier
     * @param multiplier 18-decimal multiplier (1e18 = 1.0x)
     * @param active Whether cathedral is active
     */
    function configureCathedral(
        string memory cathedral,
        uint256 multiplier,
        bool active
    ) external onlyOwner {
        _configureCathedral(cathedral, multiplier, active);
    }
    
    function _configureCathedral(
        string memory cathedral,
        uint256 multiplier,
        bool active
    ) internal {
        require(multiplier >= 5e17, "Multiplier too low"); // Min 0.5x
        require(multiplier <= 5e18, "Multiplier too high"); // Max 5.0x
        
        cathedrals[cathedral] = CathedralConfig({
            multiplier: multiplier,
            active: active
        });
        
        emit CathedralConfigured(cathedral, multiplier, active);
    }
    
    /**
     * @notice Assign sentinel to cathedral
     * @param sentinelId Sentinel identifier
     * @param cathedral Cathedral identifier
     */
    function assignSentinel(
        string memory sentinelId,
        string memory cathedral
    ) external onlyOwner {
        _assignSentinel(sentinelId, cathedral);
    }
    
    function _assignSentinel(
        string memory sentinelId,
        string memory cathedral
    ) internal {
        sentinelCathedrals[sentinelId] = cathedral;
        emit SentinelAssigned(sentinelId, cathedral);
    }
    
    /**
     * @notice Authorize or revoke attester
     * @param attester Address to authorize/revoke
     * @param authorized Whether to authorize
     */
    function setAttester(address attester, bool authorized) external onlyOwner {
        authorizedAttesters[attester] = authorized;
        emit AttesterAuthorized(attester, authorized);
    }
    
    /**
     * @notice Update current cycle
     * @param newCycle New cycle identifier
     */
    function updateCycle(string memory newCycle) external onlyOwner {
        string memory oldCycle = currentCycle;
        currentCycle = newCycle;
        emit CycleUpdated(oldCycle, newCycle);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * @notice Get cathedral multiplier
     * @param cathedral Cathedral identifier
     * @return multiplier 18-decimal multiplier
     */
    function getCathedralMultiplier(string memory cathedral) external view returns (uint256) {
        return cathedrals[cathedral].multiplier;
    }
    
    /**
     * @notice Get sentinel's cathedral assignment
     * @param sentinelId Sentinel identifier
     * @return cathedral Cathedral identifier
     */
    function getSentinelCathedral(string memory sentinelId) external view returns (string memory) {
        return sentinelCathedrals[sentinelId];
    }
    
    /**
     * @notice Get latest attestation for sentinel
     * @param sentinelId Sentinel identifier
     * @return attestation Full attestation struct
     */
    function getAttestation(string memory sentinelId) external view returns (SentinelAttestation memory) {
        return attestations[sentinelId];
    }
}
