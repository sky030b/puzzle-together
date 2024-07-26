# 帕索兔蓋德 Puzzle Together
**這是一個可以讓全世界的玩家在線上同步拼拼圖，大家一起同樂的網站。**  

![hero_banner](https://puzzle-together.e055339.com/hero_banner.gif)


## 痛點與解方  
### 受物理空間的限制，只能自己玩？	vs.	與全球玩家即時連線，共享樂趣！  
### 過程中必須得佔用一個大桌面？	vs.	小小電腦視窗，自由縮放拖動！  
### 一不小心碰到，記錄全歸零？	vs.	全自動保存，保障所有進度！  
### 喜歡展示拼圖卻無處交流？	vs.	拼圖展示牆，分享與互動！

![play_together](https://puzzle-together.e055339.com/play_together.gif)
![zoom](https://puzzle-together.e055339.com/zoom.gif)
![showcase](https://puzzle-together.e055339.com/showcase.png)

## 功能介紹
### 自由創造自己的拼圖關卡
提供玩家自由發揮創意的空間，可以自選關卡的題目圖片，也可以自己決定要遊玩幾乘幾的拼圖，  
並提供三種不同的難度讓玩家挑戰，最後還可以決定是否公開遊戲室讓所有玩家加入或是僅與三五好友同樂～  

![creation](https://puzzle-together.e055339.com/creation.png)
![difficulty](https://puzzle-together.e055339.com/difficulty.png)

### 線上即時聊天室
提供線上即時溝通的聊天室，讓玩家們可以在線上溝通彼此的遊玩策略或是如何分工，  
當然，想講笑話也是可以的喔~  

![chat](https://puzzle-together.e055339.com/chat.gif)  

### 記錄玩家貢獻排行榜
遊玩過程中會記錄該關卡的累積遊玩時數(有玩家在關卡內就會累加)，也會即時更新每位玩家的拼圖貢獻數；  
通關後，系統將顯示所有玩家的貢獻數表格，並提供貢獻比例圖，讓玩家更直觀地檢視每位玩家的貢獻度；
玩家們也可以在通關後下載原始圖片喔～  

![result](https://puzzle-together.e055339.com/result.gif)

### 通關後的精彩回放功能
你是否曾經在與一群人共同完成拼圖後，感到一絲失落？  
本網站特別提供了精彩回放功能，讓你在通關後可以重溫奮戰過程，並與他人分享這段美好時光。  
辛苦的努力將會永遠留存！

![playback](https://puzzle-together.e055339.com/playback.gif)

## 架構圖
- 除了遊戲室以外的所有頁面都是使用 React 所寫，遊戲室則是用 Vanilla JavaScript 實現。
- 透過 AWS 的 S3 和 CloudFront 來託管靜態網站並存取使用者上傳的圖片。
- 使用 AWS 的 Load Balancer，搭配 GitHub Actions 做到 Server 的自動化佈署。
- 使用 Node.js + Express 作為我的後端框架，並透過 Socket.IO 來做到前端之間的畫面同步。
- 因為不只有一台 Server，所以我額外利用 ElastiCache 的 Redis 來搭建 Adapter，來讓 Server 之間可以做溝通。
- 使用 RDS(MySQL)、ElastiCache(Redis) 與 S3 來做到 Stateless。
- 上述提到的「精彩回放」功能，由於涉及大量且高頻率的資料寫入，  
  特別使用 ElastiCache (Redis) 作為中繼站儲存遊玩時的移動軌跡，  
  並設計一個 Worker 定時將資料寫入 DB，避免資料庫寫入延遲影響整個網站。
- 使用Socket.IO達成：  
  (1) 當有玩家移動拼圖時，同步所有 Client 端的畫面  
  (2) 從正在移動拼圖的玩家手上奪取拼圖  
  (3) 線上即時同步聊天室  
  (4) 當 貢獻數變動 或是 玩家進出入遊戲室 時，即時更新玩家排行榜

![architecture_diagram](https://puzzle-together.e055339.com/puzzle_together_architecture_diagram.png)
