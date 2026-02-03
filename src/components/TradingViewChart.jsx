import React, { useEffect, useRef } from 'react';

const TradingViewChart = ({ symbol = 'BTCUSD', interval = '60', height = 500 }) => {
  const container = useRef();

  useEffect(() => {
    // Clear existing widget
    if (container.current) {
      container.current.innerHTML = '';
    }

    // Create TradingView widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== 'undefined') {
        new window.TradingView.widget({
          autosize: true,
          symbol: `CRYPTO:${symbol}`,
          interval: interval,
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#0d1117',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: container.current.id,
          backgroundColor: '#0d1117',
          gridColor: 'rgba(255, 255, 255, 0.06)',
          studies: [
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies',
            'MASimple@tv-basicstudies'
          ],
          disabled_features: ['use_localstorage_for_settings'],
          enabled_features: ['study_templates'],
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol, interval]);

  return (
    <div
      id={`tradingview_${symbol}_${Date.now()}`}
      ref={container}
      style={{ height: `${height}px`, width: '100%' }}
      className="rounded-lg overflow-hidden"
    />
  );
};

export default TradingViewChart;
