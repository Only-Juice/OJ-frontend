const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
    // 獲取當前的 Git commit hash
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const shortCommitHash = commitHash.substring(0, 7);

    // 獲取當前的分支名
    const branchName = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

    // 獲取最後一次commit的時間
    const commitDate = execSync('git log -1 --format=%ci', { encoding: 'utf8' }).trim();

    // 創建 build 信息對象
    const buildInfo = {
        commitHash,
        shortCommitHash,
        branchName,
        commitDate,
        buildTime: new Date().toISOString(),
        buildTimestamp: Date.now() // Add numerical timestamp for consistency
    };

    // 確保 utils 目錄存在
    const srcDir = path.join(__dirname, '..', 'utils');
    if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
    }

    // 寫入 build 信息到 JSON 文件
    // const buildInfoPath = path.join(srcDir, 'build-info.json');
    // fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));

    // 同時創建一個 TypeScript 模組
    const buildInfoTsPath = path.join(srcDir, 'build-info.ts');
    const tsContent = `// 這個文件是自動生成的，請不要手動編輯
import type { BuildInfo } from '@/types/build-info';

export const buildInfo: BuildInfo = {
  commitHash: ${JSON.stringify(buildInfo.commitHash)},
  shortCommitHash: ${JSON.stringify(buildInfo.shortCommitHash)},
  branchName: ${JSON.stringify(buildInfo.branchName)},
  commitDate: ${JSON.stringify(buildInfo.commitDate)},
  buildTime: ${JSON.stringify(buildInfo.buildTime)},
  buildTimestamp: ${buildInfo.buildTimestamp}
};
`;
    fs.writeFileSync(buildInfoTsPath, tsContent);

    console.log('✅ Build info generated:', buildInfo);
} catch (error) {
    console.warn('⚠️  Could not generate build info:', error.message);

    // 如果無法獲取 Git 信息，創建一個默認的 build 信息
    const fallbackBuildInfo = {
        commitHash: 'unknown',
        shortCommitHash: 'unknown',
        branchName: 'unknown',
        commitDate: 'unknown',
        buildTime: new Date().toISOString(),
        buildTimestamp: Date.now()
    };

    const srcDir = path.join(__dirname, '..', 'utils');
    if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
    }

    // const buildInfoPath = path.join(srcDir, 'build-info.json');
    // fs.writeFileSync(buildInfoPath, JSON.stringify(fallbackBuildInfo, null, 2));

    // 同時創建一個 TypeScript 模組
    const buildInfoTsPath = path.join(srcDir, 'build-info.ts');
    const tsContent = `// 這個文件是自動生成的，請不要手動編輯
import type { BuildInfo } from '@/types/build-info';

export const buildInfo: BuildInfo = {
  commitHash: ${JSON.stringify(fallbackBuildInfo.commitHash)},
  shortCommitHash: ${JSON.stringify(fallbackBuildInfo.shortCommitHash)},
  branchName: ${JSON.stringify(fallbackBuildInfo.branchName)},
  commitDate: ${JSON.stringify(fallbackBuildInfo.commitDate)},
  buildTime: ${JSON.stringify(fallbackBuildInfo.buildTime)},
  buildTimestamp: ${fallbackBuildInfo.buildTimestamp}
};
`;
    fs.writeFileSync(buildInfoTsPath, tsContent);
}