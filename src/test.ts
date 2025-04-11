/** 국립국어원 표준국어대사전 MCP 서버 테스트 */

import 'dotenv/config';
import { StdDictAPI } from './stdict-api.js';

async function testDictionaryAPI() {
  try {
    const api = new StdDictAPI();
    const query = '사과';
    console.log(`"${query}" 단어 검색 테스트`);
    
    const result = await api.searchWord(query);
    
    if (result.channel.total === 0 || !result.channel.item) {
      console.log(`"${query}"에 대한 검색 결과가 없습니다.`);
      return;
    }
    
    console.log(`총 ${result.channel.total}개의 결과 중 첫 ${result.channel.item.length}개 표시:`);
    
    result.channel.item.forEach((item, index) => {
      const supNo = item.sup_no ? `${item.sup_no}` : '';
      console.log(`${index + 1}. ${item.word}${supNo} (${item.pos})`);
      console.log(`   ${item.sense.definition}`);
      console.log();
    });
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  }
}

// 테스트 실행
testDictionaryAPI().then(() => {
  console.log('테스트 완료');
}); 