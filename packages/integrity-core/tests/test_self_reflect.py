"""
Test Suite for Self-Reflection Module
======================================

Tests for safe AGI emergence framework.

Cycle: C-153
"""

import pytest
from datetime import datetime

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from self_reflect import (
    SelfReflectingLoop,
    SelfReflectionConfig,
    ReflectionOutcome,
    ReflectionResult,
    EmergenceMetrics
)


class TestSelfReflectionConfig:
    """Tests for SelfReflectionConfig"""
    
    def test_default_config(self):
        """Test default configuration values"""
        config = SelfReflectionConfig()
        
        assert config.MAX_ITERATIONS == 5
        assert config.MIN_GI_THRESHOLD == 0.95
        assert config.HIGH_STAKES_GI_THRESHOLD == 0.99
        assert config.MAX_FILE_CHANGE_PERCENT == 10
        assert config.HUMAN_VETO_REQUIRED is True
        assert config.AUTO_MERGE_ALLOWED is False
    
    def test_protected_paths(self):
        """Test protected paths are defined"""
        config = SelfReflectionConfig()
        
        assert "sentinels/" in config.PROTECTED_PATHS
        assert "config/" in config.PROTECTED_PATHS
        assert ".civic/" in config.PROTECTED_PATHS
        assert "FOUNDATION/" in config.PROTECTED_PATHS


class TestReflectionResult:
    """Tests for ReflectionResult dataclass"""
    
    def test_result_creation(self):
        """Test creating a reflection result"""
        result = ReflectionResult(
            iteration=0,
            outcome=ReflectionOutcome.SUCCESS,
            pr_id=12345,
            gi_pre=0.993,
            gi_post=0.995,
            delib_proof_hash="abc123",
            goal="Test goal",
            timestamp=datetime.utcnow().isoformat()
        )
        
        assert result.iteration == 0
        assert result.outcome == ReflectionOutcome.SUCCESS
        assert result.pr_id == 12345
        assert result.gi_pre == 0.993
        assert result.gi_post == 0.995
    
    def test_result_to_dict(self):
        """Test serialization to dict"""
        result = ReflectionResult(
            iteration=1,
            outcome=ReflectionOutcome.REJECTED,
            pr_id=None,
            gi_pre=0.94,
            gi_post=0.94,
            delib_proof_hash=None,
            goal="Failed goal",
            timestamp="2025-12-03T00:00:00"
        )
        
        data = result.to_dict()
        assert data["outcome"] == "rejected"
        assert data["pr_id"] is None
        assert data["goal"] == "Failed goal"


class TestEmergenceMetrics:
    """Tests for EmergenceMetrics dataclass"""
    
    def test_metrics_creation(self):
        """Test creating emergence metrics"""
        metrics = EmergenceMetrics(
            converged=True,
            total_iterations=3,
            prs_generated=[123, 124, 125],
            gi_trajectory=[0.993, 0.994, 0.995],
            final_gi=0.995,
            gi_stability=True,
            constitutional_constraints_upheld=True
        )
        
        assert metrics.converged is True
        assert metrics.total_iterations == 3
        assert len(metrics.prs_generated) == 3
        assert metrics.gi_stability is True
        assert metrics.system == "Mobius Systems v1.1.2"
    
    def test_metrics_to_dict(self):
        """Test serialization to dict"""
        metrics = EmergenceMetrics(
            converged=False,
            total_iterations=5,
            prs_generated=[],
            gi_trajectory=[0.94],
            final_gi=0.94,
            gi_stability=False,
            constitutional_constraints_upheld=True
        )
        
        data = metrics.to_dict()
        assert data["converged"] is False
        assert data["constitutional_constraints_upheld"] is True


class TestSelfReflectingLoop:
    """Tests for SelfReflectingLoop"""
    
    @pytest.fixture
    def loop(self):
        """Create a basic loop instance"""
        return SelfReflectingLoop()
    
    def test_loop_initialization(self, loop):
        """Test loop initializes correctly"""
        assert loop.iteration == 0
        assert loop.gi_trajectory == []
        assert loop.prs_generated == []
        assert loop.config.MAX_ITERATIONS == 5
    
    def test_default_gi_calculator(self, loop):
        """Test default GI calculator returns expected value"""
        gi = loop._default_gi_calculator()
        assert gi == 0.993
    
    def test_validate_change_size_protected_path(self, loop):
        """Test change validation rejects protected paths"""
        diff = "sentinels/some_file.py"
        assert loop._validate_change_size(diff) is False
        
        diff = "config/agents/manifest.json"
        assert loop._validate_change_size(diff) is False
    
    def test_validate_change_size_normal(self, loop):
        """Test change validation accepts normal changes"""
        diff = "packages/some_package/file.py"
        assert loop._validate_change_size(diff) is True
    
    @pytest.mark.asyncio
    async def test_run_basic(self, loop):
        """Test basic loop execution"""
        result = await loop.run(
            goal="Test documentation improvement",
            max_iters=2,
            min_gi=0.95
        )
        
        assert isinstance(result, EmergenceMetrics)
        assert result.total_iterations <= 2
        assert result.gi_stability is True  # Default GI is 0.993 > 0.95
        assert result.constitutional_constraints_upheld is True
    
    @pytest.mark.asyncio
    async def test_run_low_gi_threshold(self, loop):
        """Test loop halts when GI threshold violated"""
        # Set a custom GI calculator that returns low value
        loop.gi_calculator = lambda: 0.90
        
        result = await loop.run(
            goal="Test with low GI",
            max_iters=5,
            min_gi=0.95
        )
        
        assert result.total_iterations == 0  # Should halt immediately
        assert result.gi_stability is False
    
    @pytest.mark.asyncio
    async def test_run_convergence(self, loop):
        """Test loop converges before max iterations"""
        result = await loop.run(
            goal="Quick convergence test",
            max_iters=10,
            min_gi=0.90
        )
        
        # Without real mediator, loop should converge quickly
        assert result.converged is True
        assert result.total_iterations < 10


class TestReflectionOutcome:
    """Tests for ReflectionOutcome enum"""
    
    def test_all_outcomes_defined(self):
        """Test all expected outcomes exist"""
        outcomes = [o.value for o in ReflectionOutcome]
        
        assert "success" in outcomes
        assert "rejected" in outcomes
        assert "gi_threshold_violation" in outcomes
        assert "constitutional_violation" in outcomes
        assert "convergence" in outcomes
        assert "max_iterations_reached" in outcomes


# ============================================================================
# Integration Tests
# ============================================================================

class TestIntegration:
    """Integration tests for self-reflection with kernel"""
    
    @pytest.mark.asyncio
    async def test_full_cycle_low_stakes(self):
        """Test full low-stakes reflection cycle"""
        loop = SelfReflectingLoop()
        
        result = await loop.run(
            goal="Improve documentation clarity in docs/",
            max_iters=3,
            min_gi=0.95
        )
        
        assert result.converged is True
        assert result.constitutional_constraints_upheld is True
        assert all(gi >= 0.95 for gi in result.gi_trajectory) or len(result.gi_trajectory) == 0
    
    @pytest.mark.asyncio
    async def test_full_cycle_high_stakes(self):
        """Test full high-stakes reflection cycle"""
        loop = SelfReflectingLoop()
        
        result = await loop.run(
            goal="Detect and remediate simulated non-maleficence violation",
            max_iters=5,
            min_gi=0.99  # Higher threshold
        )
        
        # With 0.993 default GI and 0.99 threshold, might not converge fully
        assert result.constitutional_constraints_upheld is True


# ============================================================================
# Entry Point
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
