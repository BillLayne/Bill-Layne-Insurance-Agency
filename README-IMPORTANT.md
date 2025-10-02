# ⚠️ IMPORTANT: Repository Safety Rules

## DO NOT:
- ❌ Copy files from other repositories into this folder
- ❌ Merge or pull from any repository other than Bill-Layne-Insurance-Agency
- ❌ Push directly to the `main` branch
- ❌ Download and extract zip files from GitHub into this directory

## ALWAYS:
- ✅ Work in the `development` branch
- ✅ Verify the git remote: `git remote -v` (should show Bill-Layne-Insurance-Agency.git)
- ✅ Create a pull request to merge development → main
- ✅ Keep the blog repository in a completely separate folder

## Safe Workflow:
```bash
# 1. Switch to development branch
git checkout development

# 2. Make your changes

# 3. Commit and push
git add .
git commit -m "describe your changes"
git push origin development

# 4. Create pull request on GitHub to merge to main
# Go to: https://github.com/BillLayne/Bill-Layne-Insurance-Agency/pulls
```

## If Blog Content Appears Again:
```bash
# Restore from backup
git reset --hard origin/backup-working-site
git push -f origin main
```

## Backup Branch:
- `backup-working-site` - Your clean insurance website (created Oct 2, 2025)
