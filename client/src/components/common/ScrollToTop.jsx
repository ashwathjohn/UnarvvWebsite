import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    /*
     * Do not force scroll-to-top when the URL
     * contains a section hash such as:
     *
     * /#about
     * /#register
     * /#faq
     *
     * Those should scroll to their respective
     * sections instead.
     */
    if (window.location.hash) {
      return;
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

export default ScrollToTop;