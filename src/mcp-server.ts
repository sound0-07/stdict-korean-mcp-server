/** 국립국어원 표준국어대사전 MCP 서버 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StdDictAPI } from "./stdict-api.js";
import { RequestHandlerExtra, ToolResponse } from "./types.js";

interface SearchWordParams {
  query?: string;
  start?: number;
  num?: number;
  random_string?: string;
}

export class StdDictMcpServer {
  private server: McpServer;
  private dictionaryService: StdDictAPI;
  
  constructor() {
    this.server = new McpServer({
      name: '국립국어원 표준국어대사전',
      version: '1.0.0',
    });

    this.dictionaryService = new StdDictAPI();

    // 도구 초기화
    this.initalizeTools();
  }

  getServer(): McpServer {
    return this.server;
  }

  private initalizeTools(): void {
    // 단어 검색 도구
    (this.server as any).tool("mcp_stdict_search_word", {
      description: "국립국어원 표준국어대사전에서 단어를 검색합니다.",
      inputSchema: z.object({
        query: z.string().optional(),
        start: z.number().optional(),
        num: z.number().optional(),
        random_string: z.string().optional(),
      }),
      callback: this.handleSearchWord.bind(this),
    });
  }

  private async handleSearchWord(params: SearchWordParams, extra: RequestHandlerExtra): Promise<ToolResponse> {
    try {
      // query가 없는 경우 안내 메시지 반환
      if (!params.query && !params.random_string) {
        return {
          content: [
            {
              type: 'text',
              text: '검색할 단어를 입력해주세요.',
            },
          ],
        };
      }

      // 단어 검색 수행
      const searchQuery = params.query || '';
      const searchStart = params.start || 1;
      const searchNum = params.num || 10;
      
      const result = await this.dictionaryService.searchWord(searchQuery, searchStart, searchNum);
      
      // 검색 결과가 없는 경우
      if (result.channel.total === 0 || !result.channel.item) {
        return {
          content: [
            {
              type: 'text',
              text: `"${searchQuery}"에 대한 검색 결과가 없습니다.`,
            },
          ],
        };
      }
      
      // 검색 결과 형식화
      let responseText = `"${searchQuery}" 검색 결과:\n\n`;
      
      result.channel.item.forEach((item, index) => {
        const supNo = item.sup_no ? `${item.sup_no}` : '';
        responseText += `${index + 1}. ${item.word}${supNo} (${item.pos})\n`;
        responseText += `   ${item.sense.definition}\n\n`;
      });
      
      responseText += `총 ${result.channel.total}개의 결과 중 ${result.channel.start}부터 ${Math.min(result.channel.start + result.channel.num - 1, result.channel.total)}까지 표시됨`;
      
      return {
        content: [
          {
            type: 'text',
            text: responseText,
          },
        ],
      };
    } catch (error) {
      console.error('단어 검색 오류:', error);
      return {
        content: [
          {
            type: 'text',
            text: `단어 검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
          },
        ],
        isError: true,
      };
    }
  }
}