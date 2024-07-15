import { useEffect } from "react";

// src/pages/NotFoundPage.jsx
const NotFoundPage = () => {
  useEffect(() => {
    document.title = '帕索兔蓋德 - 找不到頁面';
  }, [])

  return (
    <div>
      <h1>404 - Not Found</h1>
      {/* <p>Sorry, the page you are looking for does not exist.</p> */}
      <div>不好意思，您所搜尋的頁面不存在。</div>
    </div>
  );
};

export default NotFoundPage;
