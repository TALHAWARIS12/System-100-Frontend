import React, { useEffect, useRef, useMemo } from 'react';

const TradingViewChart = ({ symbol = 'BTCUSD', interval = '60', height = 500 }) => {
  const container = useRef();
  const widgetRef = useRef(null);
  // Stable container ID that doesn't change on re-render
  const containerId = useMemo(() => `tradingview_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`, [symbol]);

  useEffect(() => {
    // Clear existing widget
    if (container.current) {
      container.current.innerHTML = '';
    }
    widgetRef.current = null;

    // Determine exchange prefix based on symbol
    let fullSymbol = symbol;
    if (symbol === 'XAUUSD') {
      fullSymbol = 'OANDA:XAUUSD';
    } else if (['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD'].includes(symbol)) {
      fullSymbol = `FX:${symbol}`;
    } else if (!symbol.includes(':')) {
      fullSymbol = `CRYPTO:${symbol}`;
    }

    const initWidget = () => {
      if (typeof window.TradingView !== 'undefined' && container.current) {
        try {
          widgetRef.current = new window.TradingView.widget({
            autosize: true,
            symbol: fullSymbol,
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
            container_id: containerId,
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
        } catch (err) {
          console.warn('TradingView widget init error:', err.message);
        }
      }
    };

    // Check if TradingView script already loaded
    if (typeof window.TradingView !== 'undefined') {
      initWidget();
    } else {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    }

    return () => {
      if (widgetRef.current) {
        try { widgetRef.current.remove(); } catch (e) { /* ignore */ }
        widgetRef.current = null;
      }
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, interval, containerId]);

  return (
    <div
      id={containerId}
      ref={container}
      style={{ height: `${height}px`, width: '100%' }}
      className="rounded-lg overflow-hidden"
    />
  );
};

export default TradingViewChart;
