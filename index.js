// index.js (수정된 코드)

import "dotenv/config";
import cron from "node-cron";
import fetch from 'node-fetch'; // fetch를 사용하려면 Node.js 환경에 따라 require 또는 import가 필요합니다.

const cronTimer = process.env.CRON_TIMER;
const baseURL = process.env.BASE_URL;

// 1. 엔드포인트는 JSON 배열 대신 단순 문자열로 정의 (혹은 직접 경로 설정)
//    - 코드 단순화를 위해, ENDPOINTS 환경 변수 사용 대신 경로를 직접 정의하거나,
//      환경 변수를 단순 문자열로 가져오는 것이 더 안전합니다.
const ENDPOINT_PATH = process.env.ENDPOINT_PATH;

// 2. 쿼리 파라미터 대신 API 키를 환경 변수에서 직접 가져옵니다.
//    - 환경 변수 이름 SCHEDULER_API_KEY가 API 키 자체를 담고 있어야 합니다.
const API_KEY_SECRET = process.env.SCHEDULER_API_KEY; 

// 3. 잘못된 쿼리 파라미터를 생성하는 함수 제거
// function getRandomQueryParams(arr) { ... }

// 4. 불필요한 JSON.parse 호출 제거
// const endpoints = JSON.parse(process.env.ENDPOINTS); // ❌ 제거
// const queryParams = JSON.parse(process.env.QUERY_PARAMS); // ❌ 제거


cron.schedule(cronTimer, async () => {
    if (!baseURL || !API_KEY_SECRET) {
        console.error("❌ ERROR: BASE_URL or API_KEY_SECRET is missing.");
        return;
    }

    const url = `${baseURL}${ENDPOINT_PATH}`; // 쿼리 파라미터 제거
    
    console.log(`🚀 Attempting to trigger: ${url}`);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 🔑 API 키를 헤더로 전달: Rails 컨트롤러가 요구하는 형식
                'X-API-Key': API_KEY_SECRET 
            },
            // POST 요청이지만, 본문은 필요하지 않으므로 비워둡니다.
        });

        const status = response.status;
        console.log(`✅ Request sent. Status: ${status}. URL: ${response.url}`);

        if (status === 401) {
            console.error("❌ AUTH FAILED: Check API_KEY_SECRET value.");
        } else if (!response.ok) {
            const errorBody = await response.text();
            console.error(`⚠️ HTTP Error ${status}: ${errorBody}`);
        }

    } catch (error) {
        console.error("❌ FETCH ERROR:", error.message);
    }
});
