import React, { useEffect, useRef, memo } from 'react';

/**
 * TradingView Forex Widget
 * Displays real-time forex charts and technical analysis
 */
const TradingViewForex = memo(({ 
  symbol = 'EURUSD', 
  interval = 'H1',
  theme = 'dark',
  height = 500,
  showToolbar = true
}) => {
  const container = useRef(null);
  const widgetId = useRef(`tradingview_forex_${Date.now()}`);

  useEffect(() => {
    // Format symbol for TradingView
    const tvSymbol = `FX:${symbol.toUpperCase()}`;
    
    // Map interval to TradingView format
    const intervalMap = {
      'M1': '1', 'M5': '5', 'M15': '15', 'M30': '30',
      'H1': '60', 'H4': '240', 'D1': 'D', 'W1': 'W', 'MN': 'M'
    };
    const tvInterval = intervalMap[interval] || '60';

    // Clear existing widget
    if (container.current) {
      container.current.innerHTML = `<div id="${widgetId.current}" style="height: ${height}px; width: 100%;"></div>`;
    }

    // Load TradingView script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    
    script.onload = () => {
      if (typeof window.TradingView !== 'undefined' && container.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: tvInterval,
          timezone: 'Etc/UTC',
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: '#0d1117',
          enable_publishing: false,
          allow_symbol_change: true,
          hide_top_toolbar: !showToolbar,
          hide_legend: false,
          hide_side_toolbar: false,
          save_image: false,
          container_id: widgetId.current,
          backgroundColor: '#0d1117',
          gridColor: 'rgba(255, 255, 255, 0.06)',
          studies: [
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies'
          ],
          watchlist: [
            'FX:EURUSD',
            'FX:GBPUSD',
            'FX:USDJPY',
            'FX:AUDUSD',
            'FX:USDCAD',
            'FX:USDCHF',
            'FX:NZDUSD',
            'FX:EURGBP',
            'FX:EURJPY',
            'FX:GBPJPY'
          ],
          details: true,
          hotlist: true,
          calendar: true
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol, interval, theme, height, showToolbar]);

  return (
    <div ref={container} className="rounded-lg overflow-hidden bg-dark-800 border border-dark-600">
      <div id={widgetId.current} style={{ height: `${height}px`, width: '100%' }} />
    </div>
  );
});

TradingViewForex.displayName = 'TradingViewForex';

/**
 * TradingView Mini Chart Widget - Perfect for dashboard cards
 */
export const TradingViewMiniChart = memo(({ symbol = 'EURUSD', height = 200 }) => {
  const container = useRef(null);
  const widgetId = useRef(`tv_mini_${symbol}_${Date.now()}`);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';
    
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: `FX:${symbol}`,
      width: '100%',
      height: height,
      locale: 'en',
      dateRange: '1D',
      colorTheme: 'dark',
      isTransparent: true,
      autosize: true,
      largeChartUrl: ''
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, height]);

  return (
    <div ref={container} className="tradingview-widget-container">
      <div className="tradingview-widget-container__widget" style={{ height: `${height}px` }}></div>
    </div>
  );
});

TradingViewMiniChart.displayName = 'TradingViewMiniChart';

/**
 * TradingView Ticker Tape - Shows scrolling forex prices
 */
export const TradingViewTicker = memo(() => {
  const container = useRef(null);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';
    
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'FX:EURUSD', title: 'EUR/USD' },
        { proName: 'FX:GBPUSD', title: 'GBP/USD' },
        { proName: 'FX:USDJPY', title: 'USD/JPY' },
        { proName: 'FX:AUDUSD', title: 'AUD/USD' },
        { proName: 'FX:USDCAD', title: 'USD/CAD' },
        { proName: 'FX:USDCHF', title: 'USD/CHF' },
        { proName: 'FX:NZDUSD', title: 'NZD/USD' },
        { proName: 'FX:EURGBP', title: 'EUR/GBP' }
      ],
      showSymbolLogo: true,
      colorTheme: 'dark',
      isTransparent: true,
      displayMode: 'adaptive',
      locale: 'en'
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div ref={container} className="tradingview-widget-container mb-4">
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
});

TradingViewTicker.displayName = 'TradingViewTicker';

/**
 * TradingView Economic Calendar Widget
 */
export const TradingViewCalendar = memo(({ height = 400 }) => {
  const container = useRef(null);

  useEffect(() => {
    if (!container.current) return;

    container.current.innerHTML = '';
    
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: 'dark',
      isTransparent: true,
      width: '100%',
      height: height,
      locale: 'en',
      importanceFilter: '-1,0,1',
      currencyFilter: 'USD,EUR,GBP,JPY,AUD,CAD,CHF,NZD'
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [height]);

  return (
    <div ref={container} className="tradingview-widget-container">
      <div className="tradingview-widget-container__widget" style={{ height: `${height}px` }}></div>
    </div>
  );
});

TradingViewCalendar.displayName = 'TradingViewCalendar';

export default TradingViewForex;
