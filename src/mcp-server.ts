/** 국립국어원 표준국어대사전 MCP 서버 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StdDictAPI } from "./stdict-api.js";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";

export class StdDictMcpServer {
  private server: McpServer;
  private dictionaryService: StdDictAPI;
  
  constructor() {
    this.server = new McpServer({
      name: '국립국어원 표준국어대사전',
      version: '1.0.0',
    });

    this.dictionaryService = new StdDictAPI();

    // 리소스, 도구 초기화
    this.initalizeResources();
    this.initalizeTools();
  }

  getServer(): McpServer {
    return this.server;
  }

  private initalizeResources(): void {
    // 단어 검색 리소스
    this.server.resource(
      'word-search',
      new ResourceTemplate('stdict://word/{query}', { list: undefined }),
      async (uri: URL, params: { query?: string; start?: number; num?: number }) => {
        try {
          const result = await this.dictionaryService.searchWord(
            params.query || "",
          );

          let textContent = `"${params.query}" 검색 결과\n\n`;
          
          if (!result.channel?.item || result.channel.item.length === 0) {
            textContent += '검색 결과가 없습니다.';
          } else {
            result.channel.item.forEach((item: any, index: number) => {
              textContent += `${index + 1}. ${item.word}`;
              if (item.pos) textContent += ` [${item.pos}]`;
              textContent += '\n';
              
              const sense = Array.isArray(item.sense) ? item.sense : [item.sense];
              sense.forEach((s: any, idx: number) => {
                textContent += ` ${idx + 1}) ${s.definition}\n`;
              });
              textContent += '\n';
            });
          }

          return {
            contents: [{
              uri: uri.href,
              text: textContent
            }]
          };
        } catch (error) {
          return {
            contents: [{
              uri: uri.href,
              text: `오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
            }]
          };
        }
      }
    );

    // 랜덤 단어 리소스
    // this.server.resource(
    //   'random-word',
    //   new ResourceTemplate('stdict://random', { list: undefined }),
    //   async (uri: URL) => {
    //     try {
    //       const randomWords = ["사랑", "행복", "희망", "자유", "평화", "정의", "우정", "시간", "기쁨", "슬픔"];
    //       const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];
          
    //       const result = await this.dictionaryService.searchWord(randomWord, 1, 1);
          
    //       let textContent = `랜덤 단어: "${randomWord}"\n\n`;
          
    //       if (!result.channel?.item || result.channel.item.length === 0) {
    //         textContent += '검색 결과가 없습니다.';
    //       } else {
    //         const item = result.channel.item[0];
    //         textContent += `${item.word}`;
    //         if (item.pos) textContent += ` [${item.pos}]`;
    //         textContent += '\n';
            
    //         const sense = Array.isArray(item.sense) ? item.sense : [item.sense];
    //         sense.forEach((s: any, idx: number) => {
    //           textContent += `${idx + 1}) ${s.definition}\n`;
    //         });
    //       }

    //       return {
    //         contents: [{
    //           uri: uri.href,
    //           text: textContent
    //         }]
    //       };
    //     } catch (error) {
    //       return {
    //         contents: [{
    //           uri: uri.href,
    //           text: `오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    //         }]
    //       };
    //     }
    //   }
    // );
  }

  private initalizeTools(): void {
    // 단어 검색 도구
    this.server.tool(
      "search_word",
      {
        query: z.string().optional().describe("검색할 단어나 구문"),
        start: z.number().optional().describe("검색 결과 시작 인덱스"),
        num: z.number().optional().describe("가져올 결과 수")
      },
      async (args: { query?: string; start?: number; num?: number }, extra: RequestHandlerExtra) => {
        try {
          const result = await this.dictionaryService.searchWord(args.query || "");
          return {
            content: [{ 
              type: "text", 
              text: JSON.stringify(result, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{ 
              type: "text", 
              text: `오류 발생: ${error instanceof Error ? error.message : String(error)}`
            }],
            isError: true
          };
        }
      }
    );

    // 단어 상세정보 조회 도구 (현재 API에는 없으므로 주석 처리)
    /*
    this.server.tool(
      "getWordDetail",
      {
        target_code: z.string().describe("조회할 단어 코드")
      },
      async ({ target_code }, extra: RequestHandlerExtra): Promise<ToolResponse> => {
        const result = await this.dictionaryService.getWordDetail(target_code);
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify(result, null, 2)
          }]
        };
      }
    );
    */

    // 랜덤 단어 가져오기 도구 (기본 검색 도구의 변형)
    // this.server.tool(
    //   "getRandom_word",
    //   {
    //     random_string: z.string().optional()
    //   },
    //   async (args: { random_string?: string }, extra: RequestHandlerExtra) => {
    //     // 랜덤 단어 리스트 - 실제 서비스에서는 DB에서 가져오거나 다른 방식으로 구현할 수 있음
    //     const randomWords = ["사랑", "행복", "희망", "자유", "평화", "정의", "우정", "시간", "기쁨", "슬픔"];
    //     const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];
        
    //     try {
    //       const result = await this.dictionaryService.searchWord(randomWord, 1, 1);
    //       return {
    //         content: [{ 
    //           type: "text", 
    //           text: JSON.stringify(result, null, 2)
    //         }]
    //       };
    //     } catch (error) {
    //       return {
    //         content: [{ 
    //           type: "text", 
    //           text: `오류 발생: ${error instanceof Error ? error.message : String(error)}`
    //         }],
    //         isError: true
    //       };
    //     }
    //   }
    // );
  }
}