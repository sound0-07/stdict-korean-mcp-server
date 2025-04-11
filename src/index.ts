import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";
import type { StdictItem } from "./types/stdict.js";
import { StdictService } from "./services/stdict.service.js";

dotenv.config();

const apiKey = process.env.STDICT_KOREAN_API_KEY;
if (!apiKey) {
  throw new Error("STDICT_KOREAN_API_KEY is not defined in environment variables");
}

const stdictService = new StdictService(apiKey);

// MCP 서버 생성
const server = new McpServer({
  name: "stdict-korean",
  version: "1.0.0",
  description: "한국어 표준국어대사전 MCP 서버"
});

// 단어 리소스 정의
server.resource(
  "word",
  new ResourceTemplate("word://{query}", { list: undefined }),
  async (uri, variables) => {
    const query = variables.query as string;
    try {
      const result = await stdictService.searchWord(query);
      
      if (!result.channel.item || (Array.isArray(result.channel.item) && result.channel.item.length === 0)) {
        return {
          contents: [{
            uri: uri.href,
            text: `"${query}"에 대한 검색 결과가 없습니다.`
          }]
        };
      }

      const items: StdictItem[] = Array.isArray(result.channel.item) ? result.channel.item : [result.channel.item];
      
      // 리소스 내용 생성
      let content = `# ${query}\n\n`;
      
      items.forEach((item, index) => {
        const supNo = item.sup_no ? `${item.sup_no}` : "";
        const pos = item.pos ? `(${item.pos})` : "";
        
        content += `## 의미 ${index + 1}${supNo ? ` [${supNo}]` : ""} ${pos}\n`;
        content += `${item.sense.definition}\n\n`;
        
        if (item.sense.type) {
          content += `유형: ${item.sense.type}\n`;
        }
      });

      return {
        contents: [{
          uri: uri.href,
          text: content
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          text: `"${query}" 검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        }]
      };
    }
  }
);

// 단어 검색 도구
server.tool(
  "search_word",
  {
    query: z.string().min(1).describe("검색할 한국어 단어"),
    method: z.enum(["exact", "include", "start", "end"]).optional().describe("검색 방식(정확히 일치, 포함, 시작, 끝)")
  },
  async ({ query, method }: { query: string, method?: string }) => {
    try {
      const result = await stdictService.searchWord(query, { method: method as any });
      
      if (!result.channel.item || (Array.isArray(result.channel.item) && result.channel.item.length === 0)) {
        return {
          content: [{ 
            type: "text", 
            text: `"${query}"에 대한 검색 결과가 없습니다.` 
          }]
        };
      }

      const items: StdictItem[] = Array.isArray(result.channel.item) ? result.channel.item : [result.channel.item];
      
      // 자연어 응답 생성
      let response = `"${query}"에 대한 검색 결과:\n\n`;
      
      items.forEach((item, index) => {
        const supNo = item.sup_no ? `${item.sup_no}` : "";
        const pos = item.pos ? `(${item.pos})` : "";
        
        response += `${index + 1}. ${item.word}${supNo ? ` [${supNo}]` : ""} ${pos}: ${item.sense.definition}\n`;
      });
      
      if (items.length > 1) {
        response += `\n총 ${items.length}개의 결과가 있습니다.`;
      }

      return {
        content: [{ type: "text", text: response }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
        }]
      };
    }
  }
);

// 상세 정보 도구
server.tool(
  "get_word_details",
  {
    word: z.string().min(1).describe("상세 정보를 볼 단어"),
    target_code: z.number().optional().describe("단어의 고유 코드")
  },
  async ({ word, target_code }: { word: string, target_code?: number }) => {
    try {
      const result = await stdictService.searchWord(word, { 
        method: "exact",
        ...(target_code ? { target_code: target_code.toString() } : {})
      });
      
      if (!result.channel.item || (Array.isArray(result.channel.item) && result.channel.item.length === 0)) {
        return {
          content: [{ 
            type: "text", 
            text: `"${word}"에 대한 상세 정보를 찾을 수 없습니다.` 
          }]
        };
      }

      const items: StdictItem[] = Array.isArray(result.channel.item) ? result.channel.item : [result.channel.item];
      const item = items[0];
      
      let details = `# ${item.word} ${item.pos ? `(${item.pos})` : ""}\n\n`;
      details += `## 의미\n${item.sense.definition}\n\n`;
      
      if (item.sense.type) {
        details += `## 유형\n${item.sense.type}\n\n`;
      }
      
      details += `## 참조\n${item.sense.link || '참조 링크 없음'}\n`;
      
      return {
        content: [{ type: "text", text: details }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `상세 정보 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
        }]
      };
    }
  }
);

// 예문 요청 프롬프트
server.prompt(
  "word_example",
  {
    word: z.string(),
    definition: z.string()
  },
  ({ word, definition }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `다음 단어를 활용한 예문을 만들어주세요: ${word}
   
의미: ${definition}
   
위 단어를 사용하여 자연스러운 예문 3개를 만들어주세요.`
      }
    }]
  })
);

// 단어 설명 프롬프트
server.prompt(
  "explain_word",
  {
    word: z.string(),
    definition: z.string()
  },
  ({ word, definition }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `다음 한국어 단어를 쉽게 설명해주세요: ${word}
   
사전적 정의: ${definition}
   
위 단어의 의미를 초등학생도 이해할 수 있게 쉽게 설명해주세요.`
      }
    }]
  })
);

// 서버 시작
const transport = new StdioServerTransport();
await server.connect(transport);

console.log("표준국어대사전 MCP 서버가 실행 중입니다..."); 