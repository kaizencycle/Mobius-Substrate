#!/bin/bash
# ============================================================================
# Mobius Branch Cleanup Script
# EPICON-compliant: Intent before deletion
# 
# @license CC0-1.0
# @author Mobius Systems (kaizencycle:michaeljudan)
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DRY_RUN=${DRY_RUN:-true}
INTENT_REQUIRED=${INTENT_REQUIRED:-true}
LOG_FILE="branch_cleanup_$(date +%Y%m%d_%H%M%S).log"

# ============================================================================
# EPICON Intent Declaration
# ============================================================================

declare_intent() {
    local action="$1"
    local scope="$2"
    local rationale="$3"
    
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}🌀 EPICON INTENT DECLARATION${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}Action:${NC}     $action"
    echo -e "${BLUE}Scope:${NC}      $scope"
    echo -e "${BLUE}Rationale:${NC}  $rationale"
    echo -e "${BLUE}Timestamp:${NC}  $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo -e "${BLUE}Operator:${NC}   $(git config user.name) <$(git config user.email)>"
    echo ""
    
    # Log intent
    {
        echo "=== EPICON INTENT ==="
        echo "action: $action"
        echo "scope: $scope"
        echo "rationale: $rationale"
        echo "timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
        echo "operator: $(git config user.name) <$(git config user.email)>"
        echo ""
    } >> "$LOG_FILE"
}

# ============================================================================
# Branch Analysis Functions
# ============================================================================

get_branch_info() {
    local branch="$1"
    local last_commit=$(git log -1 --format="%H" "origin/$branch" 2>/dev/null || echo "unknown")
    local last_date=$(git log -1 --format="%ci" "origin/$branch" 2>/dev/null || echo "unknown")
    local last_author=$(git log -1 --format="%an" "origin/$branch" 2>/dev/null || echo "unknown")
    local last_message=$(git log -1 --format="%s" "origin/$branch" 2>/dev/null | head -c 60)
    
    echo "$last_commit|$last_date|$last_author|$last_message"
}

is_merged() {
    local branch="$1"
    local base="${2:-main}"
    
    # Check if branch is merged into base
    git branch -r --merged "origin/$base" 2>/dev/null | grep -q "origin/$branch" && return 0
    return 1
}

get_branch_age_days() {
    local branch="$1"
    local last_date=$(git log -1 --format="%ct" "origin/$branch" 2>/dev/null || echo "0")
    local now=$(date +%s)
    local age_seconds=$((now - last_date))
    local age_days=$((age_seconds / 86400))
    echo "$age_days"
}

has_open_pr() {
    local branch="$1"
    # This would require GitHub CLI - simplified check
    # In production, use: gh pr list --head "$branch" --state open
    echo "unknown"
}

# ============================================================================
# Display Functions
# ============================================================================

print_header() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          🌀 MOBIUS BRANCH CLEANUP UTILITY                      ║${NC}"
    echo -e "${GREEN}║              Intent Before Deletion                            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_branch_status() {
    local branch="$1"
    local status="$2"
    local age="$3"
    local message="$4"
    
    local status_icon=""
    local status_color=""
    
    case "$status" in
        "merged")
            status_icon="✅"
            status_color="$GREEN"
            ;;
        "stale")
            status_icon="⚠️"
            status_color="$YELLOW"
            ;;
        "active")
            status_icon="🔵"
            status_color="$BLUE"
            ;;
        "protected")
            status_icon="🔒"
            status_color="$CYAN"
            ;;
        *)
            status_icon="❓"
            status_color="$NC"
            ;;
    esac
    
    printf "${status_color}%-8s${NC} %-50s %3sd  %.50s\n" \
        "$status_icon $status" "$branch" "$age" "$message"
}

# ============================================================================
# Main Analysis
# ============================================================================

analyze_branches() {
    echo -e "${BLUE}Fetching latest branch information...${NC}"
    git fetch --prune origin 2>/dev/null
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}BRANCH ANALYSIS${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    printf "%-8s %-50s %4s  %s\n" "STATUS" "BRANCH" "AGE" "LAST COMMIT"
    echo "──────── ────────────────────────────────────────────────── ──── ──────────────────────────────────────────────────"
    
    # Reset arrays
    MERGED_BRANCHES=()
    STALE_BRANCHES=()
    ACTIVE_BRANCHES=()
    
    # Get all remote branches except HEAD
    for branch in $(git branch -r | grep -v HEAD | sed 's/origin\///' | sort); do
        local info=$(get_branch_info "$branch")
        local age=$(get_branch_age_days "$branch")
        local message=$(echo "$info" | cut -d'|' -f4)
        
        # Skip protected branches
        if [[ "$branch" == "main" || "$branch" == "master" || "$branch" == "develop" ]]; then
            print_branch_status "$branch" "protected" "$age" "$message"
            continue
        fi
        
        # Skip canonical working branches
        if [[ "$branch" == "claude/atlas" || "$branch" == "cursor/aurea" ]]; then
            print_branch_status "$branch" "protected" "$age" "$message"
            continue
        fi
        
        # Check if merged
        if is_merged "$branch" "main"; then
            print_branch_status "$branch" "merged" "$age" "$message"
            MERGED_BRANCHES+=("$branch")
        # Check if stale (>30 days without activity)
        elif [[ "$age" -gt 30 ]]; then
            print_branch_status "$branch" "stale" "$age" "$message"
            STALE_BRANCHES+=("$branch")
        else
            print_branch_status "$branch" "active" "$age" "$message"
            ACTIVE_BRANCHES+=("$branch")
        fi
    done
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}SUMMARY${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${GREEN}✅ Merged branches (safe to delete):${NC} ${#MERGED_BRANCHES[@]}"
    echo -e "${YELLOW}⚠️  Stale branches (>30 days):${NC}        ${#STALE_BRANCHES[@]}"
    echo -e "${BLUE}🔵 Active branches:${NC}                   ${#ACTIVE_BRANCHES[@]}"
    echo ""
}

# ============================================================================
# Cleanup Functions
# ============================================================================

cleanup_merged() {
    if [[ ${#MERGED_BRANCHES[@]} -eq 0 ]]; then
        echo -e "${GREEN}No merged branches to clean up.${NC}"
        return
    fi
    
    declare_intent \
        "delete_branches" \
        "${#MERGED_BRANCHES[@]} merged branches" \
        "Removing branches that have been merged to main. These branches served their purpose and their commits are preserved in main's history."
    
    echo ""
    echo -e "${YELLOW}The following merged branches will be deleted:${NC}"
    for branch in "${MERGED_BRANCHES[@]}"; do
        echo "  - $branch"
    done
    echo ""
    
    if [[ "$INTENT_REQUIRED" == "true" ]]; then
        read -p "Confirm deletion? Type 'DELETE' to proceed: " confirm
        if [[ "$confirm" != "DELETE" ]]; then
            echo -e "${RED}Aborted. No branches deleted.${NC}"
            return
        fi
    fi
    
    for branch in "${MERGED_BRANCHES[@]}"; do
        if [[ "$DRY_RUN" == "true" ]]; then
            echo -e "${CYAN}[DRY RUN]${NC} Would delete: $branch"
        else
            echo -e "${GREEN}Deleting:${NC} $branch"
            git push origin --delete "$branch" 2>/dev/null && \
                echo "  ✅ Deleted $branch" >> "$LOG_FILE" || \
                echo "  ❌ Failed to delete $branch" >> "$LOG_FILE"
        fi
    done
    
    echo ""
    echo -e "${GREEN}Cleanup complete. Log saved to: $LOG_FILE${NC}"
}

cleanup_stale() {
    if [[ ${#STALE_BRANCHES[@]} -eq 0 ]]; then
        echo -e "${GREEN}No stale branches to review.${NC}"
        return
    fi
    
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}STALE BRANCH REVIEW${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "These branches have had no activity for >30 days."
    echo "Review each one to decide whether to keep or delete."
    echo ""
    
    for branch in "${STALE_BRANCHES[@]}"; do
        local info=$(get_branch_info "$branch")
        local age=$(get_branch_age_days "$branch")
        local last_date=$(echo "$info" | cut -d'|' -f2)
        local author=$(echo "$info" | cut -d'|' -f3)
        local message=$(echo "$info" | cut -d'|' -f4)
        
        echo -e "${YELLOW}Branch:${NC} $branch"
        echo -e "  Last commit: $last_date by $author"
        echo -e "  Message: $message"
        echo -e "  Age: $age days"
        echo ""
        
        read -p "  Delete this branch? [y/N/q to quit]: " choice
        case "$choice" in
            y|Y)
                declare_intent \
                    "delete_branch" \
                    "$branch" \
                    "User confirmed deletion of stale branch after review"
                
                if [[ "$DRY_RUN" == "true" ]]; then
                    echo -e "  ${CYAN}[DRY RUN]${NC} Would delete: $branch"
                else
                    git push origin --delete "$branch" 2>/dev/null && \
                        echo -e "  ${GREEN}✅ Deleted${NC}" || \
                        echo -e "  ${RED}❌ Failed to delete${NC}"
                fi
                ;;
            q|Q)
                echo "Quitting stale branch review."
                return
                ;;
            *)
                echo -e "  ${BLUE}Keeping branch.${NC}"
                ;;
        esac
        echo ""
    done
}

# ============================================================================
# Main Menu
# ============================================================================

show_menu() {
    echo ""
    echo -e "${BLUE}What would you like to do?${NC}"
    echo ""
    echo "  1) Analyze branches (view status)"
    echo "  2) Delete merged branches"
    echo "  3) Review stale branches"
    echo "  4) Full cleanup (merged + review stale)"
    echo "  5) Toggle dry run mode (currently: $DRY_RUN)"
    echo "  q) Quit"
    echo ""
    read -p "Select option: " choice
    
    case "$choice" in
        1)
            analyze_branches
            show_menu
            ;;
        2)
            analyze_branches
            cleanup_merged
            show_menu
            ;;
        3)
            analyze_branches
            cleanup_stale
            show_menu
            ;;
        4)
            analyze_branches
            cleanup_merged
            cleanup_stale
            show_menu
            ;;
        5)
            if [[ "$DRY_RUN" == "true" ]]; then
                DRY_RUN=false
                echo -e "${RED}⚠️  Dry run DISABLED - deletions will be real!${NC}"
            else
                DRY_RUN=true
                echo -e "${GREEN}✅ Dry run ENABLED - no actual deletions${NC}"
            fi
            show_menu
            ;;
        q|Q)
            echo ""
            echo -e "${GREEN}Goodbye! Log saved to: $LOG_FILE${NC}"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option.${NC}"
            show_menu
            ;;
    esac
}

# ============================================================================
# Entry Point
# ============================================================================

main() {
    print_header
    
    # Check we're in a git repo
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}Error: Not in a git repository.${NC}"
        exit 1
    fi
    
    # Log session start
    {
        echo "=== BRANCH CLEANUP SESSION ==="
        echo "started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
        echo "repository: $(git remote get-url origin 2>/dev/null || echo 'unknown')"
        echo "operator: $(git config user.name) <$(git config user.email)>"
        echo "dry_run: $DRY_RUN"
        echo ""
    } > "$LOG_FILE"
    
    echo -e "${BLUE}Repository:${NC} $(git remote get-url origin 2>/dev/null || echo 'unknown')"
    echo -e "${BLUE}Dry Run:${NC}    $DRY_RUN"
    echo -e "${BLUE}Log File:${NC}   $LOG_FILE"
    
    show_menu
}

# Run
main "$@"
