#!/bin/bash
# Add consensus:approved label to PR

# Method 1: Using GitHub CLI (if installed)
if command -v gh &> /dev/null; then
    echo "Using GitHub CLI..."
    gh pr edit --add-label "consensus:approved"
    echo "✅ Label added!"
    exit 0
fi

# Method 2: Using curl with GitHub API (requires GITHUB_TOKEN)
if [ -n "$GITHUB_TOKEN" ]; then
    echo "Using GitHub API..."

    # Get PR number
    BRANCH="claude/find-perf-issues-mkip0uqf7otxvsrb-fXC5l"
    REPO="kaizencycle/Mobius-Substrate"

    PR_DATA=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github+json" \
        "https://api.github.com/repos/$REPO/pulls?state=open&head=kaizencycle:$BRANCH")

    PR_NUMBER=$(echo "$PR_DATA" | grep -o '"number":[0-9]*' | head -1 | grep -o '[0-9]*')

    if [ -n "$PR_NUMBER" ]; then
        echo "Found PR #$PR_NUMBER"

        # Add label
        curl -X POST \
            -H "Authorization: token $GITHUB_TOKEN" \
            -H "Accept: application/vnd.github+json" \
            "https://api.github.com/repos/$REPO/issues/$PR_NUMBER/labels" \
            -d '{"labels":["consensus:approved"]}'

        echo ""
        echo "✅ Label added to PR #$PR_NUMBER"
        echo "   https://github.com/$REPO/pull/$PR_NUMBER"
        exit 0
    else
        echo "❌ Could not find PR number"
        exit 1
    fi
fi

# Method 3: Manual instructions
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Manual Label Instructions"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Since gh CLI and GITHUB_TOKEN are not available, please add"
echo "the label manually via the GitHub web interface:"
echo ""
echo "1. Go to your PR on GitHub"
echo "2. On the right sidebar, click 'Labels'"
echo "3. Type or select: consensus:approved"
echo "4. Click outside the menu to save"
echo ""
echo "Branch: claude/find-perf-issues-mkip0uqf7otxvsrb-fXC5l"
echo "Repo: kaizencycle/Mobius-Substrate"
echo ""
echo "═══════════════════════════════════════════════════════"
