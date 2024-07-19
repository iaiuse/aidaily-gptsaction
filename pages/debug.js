"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var axios_1 = require("axios");
var Debug = function () {
    var _a = (0, react_1.useState)(''), query = _a[0], setQuery = _a[1];
    var _b = (0, react_1.useState)([]), news = _b[0], setNews = _b[1];
    var _c = (0, react_1.useState)(''), markdown = _c[0], setMarkdown = _c[1];
    var _d = (0, react_1.useState)(''), imageUrl = _d[0], setImageUrl = _d[1];
    var searchNews = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get("/api/news?query=".concat(query))];
                case 1:
                    response = _a.sent();
                    setNews(response.data.articles);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error fetching news', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var generateImage = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.post('/api/generate-image', { markdown: markdown })];
                case 1:
                    response = _a.sent();
                    setImageUrl(response.data.imageUrl);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error generating image', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="p-5">
      <h1 className="text-2xl font-bold mb-5">Debug Page</h1>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold mb-3">Search AI News</h2>
          <div className="flex space-x-3 mb-3">
            <input type="text" placeholder="Enter search term" value={query} onChange={function (e) { return setQuery(e.target.value); }} className="flex-grow px-3 py-2 border rounded"/>
            <button onClick={searchNews} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Search
            </button>
          </div>
          <div className="space-y-3">
            {news.map(function (article, index) { return (<div key={index} className="border rounded p-3">
                <h3 className="font-bold">{article.title}</h3>
                <p className="mt-1">{article.description}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-blue-500 hover:underline">
                  Read more
                </a>
              </div>); })}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-3">Generate Image from Markdown</h2>
          <textarea placeholder="Enter your markdown here" value={markdown} onChange={function (e) { return setMarkdown(e.target.value); }} className="w-full h-32 p-2 border rounded mb-3"/>
          <button onClick={generateImage} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Generate Image
          </button>
          {imageUrl && (<div className="mt-3">
              <img src={imageUrl} alt="Generated from markdown" className="max-w-full h-auto"/>
            </div>)}
        </div>
      </div>
    </div>);
};
exports.default = Debug;
