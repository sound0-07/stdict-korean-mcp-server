/** 설정 파일 */

import { AppConfig } from "./types.js";

function loadConfig(): AppConfig {
    let configData = {
        stdict: {
            apiKey: process.env.STDICT_KOREAN_API_KEY || '',
            baseUrl: 'https://stdict.korean.go.kr/api/search.do',
        },
    };

    return configData;
}

export const appConfig = loadConfig();