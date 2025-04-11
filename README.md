# 표준국어대사전 MCP 서버

국립국어원 표준국어대사전 API를 활용한 MCP(Model Context Protocol) 서버입니다. 이 서버를 통해 LLM은 한국어 단어의 정의와 용례를 검색하고 이해할 수 있습니다.

## 기능

### 리소스 (Resources)

- `word://{query}` - 특정 단어에 대한 사전 정보를 컨텍스트로 제공합니다.

### 도구 (Tools)

- `search_word` - 한국어 단어를 검색하여 결과를 반환합니다.

  - 파라미터:
    - `query`: 검색할 단어 (필수)
    - `method`: 검색 방식 ('exact', 'include', 'start', 'end') (선택)

- `get_word_details` - 특정 단어의 상세 정보를 조회합니다.
  - 파라미터:
    - `word`: 상세 정보를 볼 단어 (필수)
    - `target_code`: 단어의 고유 코드 (선택)

### 프롬프트 (Prompts)

- `word_example` - 단어를 활용한 예문 생성을 위한 프롬프트
- `explain_word` - 단어의 의미를 쉽게 설명하기 위한 프롬프트

## 설치 및 실행

### 요구사항

- Node.js v16 이상
- 국립국어원 표준국어대사전 API 키 ([신청 방법](https://stdict.korean.go.kr/openapi/openApiInfo.do))

### 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/stdict-korean-mcp-server.git
cd stdict-korean-mcp-server

# 의존성 설치
npm install
```

### 환경 변수 설정

`.env` 파일을 생성하고 API 키를 설정합니다:

```
STDICT_KOREAN_API_KEY="your_api_key_here"
```

### 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm run build
npm start
```

## MCP 클라이언트 설정

### Claude Desktop

1. Claude Desktop 설정에서 MCP 서버 추가:

   - 이름: `stdict-korean`
   - 경로: 서버 실행 경로 (예: `C:/path/to/stdict-korean-mcp-server/dist/index.js`)
   - 실행 명령어: `node`

2. Claude와의 대화에서 호출:
   ```
   @stdict-korean 사과라는 단어를 검색해줘
   ```

### Python 클라이언트 예시

```python
from mcp.client import MCPClient
from mcp.client.anthropic import AnthropicMCPClient

# MCP 클라이언트 초기화
client = MCPClient()
server = client.connect_server("stdict-korean", ["node", "/path/to/stdict-korean-mcp-server/dist/index.js"])

# Anthropic 클라이언트 설정
anthropic_client = AnthropicMCPClient(api_key="your_anthropic_api_key")

# 도구 사용 예시
result = await server.invoke_tool("search_word", {"query": "사과"})
print(result)

# 리소스 로드 예시
resource = await server.load_resource("word://사과")
print(resource)

# LLM과 통합 예시
response = await anthropic_client.messages.create(
    model="claude-3-opus-20240229",
    max_tokens=1000,
    messages=[
        {"role": "user", "content": "사과의 의미를 알려줘"}
    ],
    tools=[server]
)
```

## 사용 예시

### LLM과의 대화

```
User: "연어의 사전적 의미가 궁금해요"

LLM: [search_word 도구 사용, 쿼리: "연어"]
"연어"에 대한 검색 결과:

1. 연어(鰱魚) (명사): 입이 작고 턱이 없는 물고기.
2. 연어(鰱魚) (명사): 인공위성이 지상으로 보내는 정보를 수집하는 일.

User: "첫 번째 의미에 대해 자세히 알려주세요"

LLM: [get_word_details 도구 사용, 단어: "연어"]
# 연어(鰱魚) (명사)

## 의미
입이 작고 턱이 없는 물고기.

## 유형
일반어

## 참조
https://stdict.korean.go.kr/search/searchView.do?word_no=123456
```

### 리소스 활용 예시

```
User: "연어에 대해 초등학생이 이해할 수 있게 설명해줘"

LLM: [word://연어 리소스 로드 후 explain_word 프롬프트 사용]
연어는 바다와 강을 오가며 사는 물고기예요. 태어날 때는 강에서 태어나지만,
바다로 나가서 크게 자란 다음, 알을 낳을 때가 되면 다시 자신이 태어난
강으로 돌아와요. 이런 여행을 '회귀'라고 해요. 연어는 연어과에 속하는
물고기로, 맛있는 음식으로도 많이 먹습니다.
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 LICENSE 파일을 참조하세요.

## 감사의 말

이 프로젝트는 국립국어원 표준국어대사전 API를 활용하였습니다.
