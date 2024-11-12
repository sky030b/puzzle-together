import { Link } from 'react-router-dom';
import '../style/HomePage.css';
import { useEffect } from 'react';

const HomePage = () => {
  useEffect(() => {
    document.title = '帕索兔蓋德';
  }, [])

  return (
    <div>
      <section className="hero text-center py-5 rounded d-flex align-items-center overflow-hidden" style={{ height: "75vh" }}>
        <div className="w-75 d-flex align-items-center mx-auto">
          <div className="w-50 text-start">
            <div className="mb-5">
              <h1 className="mb-4">快來和<strong className="text-warning">帕索兔蓋德</strong><br />一起<strong className="text-warning">拼</strong>出快樂時光！</h1>
              <h4><strong className="text-warning">Puzzle Together</strong> <br />with Anyone, Anytime, Anywhere !</h4>
            </div>
            <div>
              <Link className="btn btn-warning fs-5 fw-bold py-3 px-5" to="/all-games">立即開始</Link>
            </div>
          </div>
          <div className="w-50 position-relative">
            <img className="img-fluid object-fit-cover final-image" width="400" height="400" src="https://puzzle-together.e055339.com/img-2904526839091+(4).png" alt="" />
            <img className="img-fluid object-fit-cover jump-gade position-absolute" width="400" height="400" src="https://puzzle-together.e055339.com/img-2904526839091+(2).png" alt="" />
          </div>
        </div>
      </section>

      <hr />

      <section id="features" className="features my-5">
        <h2 className="text-center mb-5">痛點與解方</h2>

        <div className="d-flex w-100 justify-content-center align-items-center mb-4">
          <div className="pain-point py-4 px-5">
            <div className="text-light fs-3">受物理空間的限制，只能自己玩？</div>
          </div>
          <div className="mx-3">
            <img src="https://puzzle-together.e055339.com/network.png" alt="" height="80" width="80" />
          </div>
          <div className="bg-light py-4 px-5">
            <div className="fs-3">與全球玩家即時連線，共享樂趣！</div>
          </div>
        </div>

        <div className="d-flex flex-row-reverse w-100 justify-content-center align-items-center mb-4">
          <div className="pain-point py-4 px-5">
            <div className="text-light fs-3">過程中必須得佔用一個大桌面？</div>
          </div>
          <div className="mx-3">
            <img src="https://puzzle-together.e055339.com/zoom.png" alt="" height="80" width="80" />
          </div>
          <div className="bg-light py-4 px-5">
            <div className="fs-3">小小電腦視窗，自由縮放拖動！</div>
          </div>
        </div>

        <div className="d-flex w-100 justify-content-center align-items-center mb-4">
          <div className="pain-point py-4 px-5">
            <div className="text-light fs-3">一不小心碰到，記錄全歸零？</div>
          </div>
          <div className="mx-3">
            <img src="https://puzzle-together.e055339.com/save.png" alt="" height="80" width="80" />
          </div>
          <div className="bg-light py-4 px-5">
            <div className="fs-3">全自動保存，保障所有進度！</div>
          </div>
        </div>

        <div className="d-flex flex-row-reverse w-100 justify-content-center align-items-center">
          <div className="pain-point py-4 px-5">
            <div className="text-light fs-3">喜歡展示拼圖卻無處交流？</div>
          </div>
          <div className="mx-3">
            <img src="https://puzzle-together.e055339.com/reaction.png" alt="" height="80" width="80" />
          </div>
          <div className="bg-light py-4 px-5">
            <div className="fs-3">拼圖展示牆，分享與互動！</div>
          </div>
        </div>
      </section>

      <hr />

      <section id="levels" className="levels py-5">
        <h2 className="text-center mb-5">關卡特色</h2>

        <div className="container">
          <div className="row row-cols-2 row-cols-lg-4 g-2 g-lg-3">
            <div className="col">
              <div className="px-3 py-5 border border-dark rounded">
                <div className="rounded-circle text-center mb-3">
                  <img src="https://puzzle-together.e055339.com/hard.png" alt="" height="80" width="80" />
                </div>
                <h3 className="mb-3 text-center">不同難度</h3>
                <div className="text-center">提供三種不同難度<br />讓不同等級的玩家都可以同樂</div>
              </div>
            </div>
            <div className="col">
              <div className="px-3 py-5 border border-dark rounded">
                <div className="rounded-circle text-center mb-3">
                  <img src="https://puzzle-together.e055339.com/chat.png" alt="" height="80" width="80" />
                </div>
                <h3 className="mb-3 text-center">聊天室</h3>
                <div className="text-center">提供即時聊天室<br />讓玩家們隨時溝通想法與合作規劃</div>
              </div>
            </div>
            <div className="col">
              <div className="px-3 py-5 border border-dark rounded">
                <div className="rounded-circle text-center mb-3">
                  <img src="https://puzzle-together.e055339.com/jigsaw.png" alt="" height="80" width="80" />
                </div>
                <h3 className="mb-3 text-center">貢獻記錄</h3>
                <div className="text-center">可隨時查看目前每位玩家的貢獻數<br />並於通關時結算</div>
              </div>
            </div>
            <div className="col">
              <div className="px-3 py-5 border border-dark rounded">
                <div className="rounded-circle text-center mb-3">
                  <img src="https://puzzle-together.e055339.com/play.png" alt="" height="80" width="80" />
                </div>
                <h3 className="mb-3 text-center">精彩回放</h3>
                <div className="text-center">完整保留遊玩過程<br />通關後可回味過往的有趣時刻</div>
              </div>
            </div>
          </div>
        </div>
      </section >

      <hr />

      <section id="gallery" className="gallery py-5">
        <h2 className="text-center mb-5">常見問題</h2>
        <div className="accordion w-75 mx-auto overflow-hidden" id="accordionExample">
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingOne">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                遊戲關卡的公開與私人標籤有什麼差異？
              </button>
            </h2>
            <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
              <div className="accordion-body">
                所有玩家都可以透過網址連結進入公開的關卡一起遊玩，私人關卡則僅能收到邀請後進入。
              </div>
            </div>
          </div>

          <div className="accordion-item">
            <h2 className="accordion-header" id="headingTwo">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                遊戲關卡什麼時候會出現在我的展示櫃？
              </button>
            </h2>
            <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
              <div className="accordion-body">
                公開的遊戲關卡會在玩家在該關卡成功拼對一塊拼圖時加入展示櫃，私人遊戲則會在收到遊戲邀請時直接加入展示櫃。
              </div>
            </div>
          </div>

          <div className="accordion-item">
            <h2 className="accordion-header" id="headingThree">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                沒有登入註冊的玩家可以玩嗎？
              </button>
            </h2>
            <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
              <div className="accordion-body">
                沒有登入的玩家僅能進入公開的遊戲，並以 匿名動物 的暱稱參與遊戲，但不會擁有屬於自己的展示櫃與關卡紀錄。
              </div>
            </div>
          </div>

          <div className="accordion-item">
            <h2 className="accordion-header" id="headingFour">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                代表色是什麼？
              </button>
            </h2>
            <div id="collapseFour" className="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#accordionExample">
              <div className="accordion-body">
                註冊時所選的代表色會用於呈現：關卡通關後的貢獻圖比例 以及 精彩回放時的軌跡，來表示是哪一位玩家所留下的紀錄。<br />註：未登入的匿名玩家則會隨機指定代表色。
              </div>
            </div>
          </div>

          <div className="accordion-item">
            <h2 className="accordion-header" id="headingFive">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
                不同難度有什麼差異？
              </button>
            </h2>
            <div id="collapseFive" className="accordion-collapse collapse" aria-labelledby="headingFive" data-bs-parent="#accordionExample">
              <div className="accordion-body">
                簡單難度：<br />目標格有格線、較清楚的底圖提示、拼對時鎖定拼圖、靠近正確目標格放開時自動放入。<br /><br />
                中等難度：<br />目標格無格線、較淺色的底圖提示、拼對時鎖定拼圖、靠近<strong className="text-danger">任意</strong>目標格放開時自動放入。<br /><br />
                困難難度：<br />目標格無格線、完全沒有底圖提示、拼對<strong className="text-danger">不</strong>鎖定拼圖、靠近<strong className="text-danger">任意</strong>目標格放開時自動放入、有 查看提示 功能。
              </div>
            </div>
          </div>

          <div className="accordion-item">
            <h2 className="accordion-header" id="headingSix">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSix" aria-expanded="false" aria-controls="collapseSix">
                我建立完關卡之後還可以調整或設定關卡嗎？
              </button>
            </h2>
            <div id="collapseSix" className="accordion-collapse collapse" aria-labelledby="headingSix" data-bs-parent="#accordionExample">
              <div className="accordion-body">
                每位玩家可以前往自己的玩家檔案中的「我創的遊戲」，對自己所創的關卡更改：遊戲標題、遊戲難度、遊戲公開設定與刪除遊戲，其他設定則無法修改。
              </div>
            </div>
          </div>

          <div className="accordion-item">
            <h2 className="accordion-header" id="headingSeven">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSeven" aria-expanded="false" aria-controls="collapseSeven">
                我可以搶奪別人手上的拼圖嗎？
              </button>
            </h2>
            <div id="collapseSeven" className="accordion-collapse collapse" aria-labelledby="headingSeven" data-bs-parent="#accordionExample">
              <div className="accordion-body rounded-bottom">
                可以喔～本遊戲鼓勵大家從別人手上奪取拼圖，來衝高自己的貢獻度與紀錄 (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧。
              </div>
            </div>
          </div>

        </div>
      </section>
    </div >
  );
};

export default HomePage;
