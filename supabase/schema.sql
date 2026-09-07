-- ==============================================================================
-- INDIAN STOCK MARKET DAILY INTELLIGENCE REPORT - SUPABASE DATABASE SCHEMA
-- ==============================================================================

-- 1. Daily Reports Table
CREATE TABLE IF NOT EXISTS public.daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trading_date DATE UNIQUE NOT NULL,
    market_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    report_html TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'PARTIAL', 'FAILED', 'MARKET_CLOSED')),
    email_status TEXT NOT NULL DEFAULT 'SKIPPED' CHECK (email_status IN ('SENT', 'FAILED', 'SKIPPED', 'PENDING')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    email_sent_at TIMESTAMPTZ
);

-- 2. Stock Movements Table (Top Gainers & Losers)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    company_name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    previous_close NUMERIC NOT NULL,
    percentage_change NUMERIC NOT NULL,
    volume BIGINT NOT NULL DEFAULT 0,
    direction TEXT NOT NULL CHECK (direction IN ('GAINER', 'LOSER')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. News Articles Table
CREATE TABLE IF NOT EXISTS public.news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_movement_id UUID NOT NULL REFERENCES public.stock_movements(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source TEXT NOT NULL,
    url TEXT NOT NULL,
    published_at TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Stock AI Analysis Table
CREATE TABLE IF NOT EXISTS public.stock_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_movement_id UUID UNIQUE NOT NULL REFERENCES public.stock_movements(id) ON DELETE CASCADE,
    primary_catalyst TEXT NOT NULL,
    explanation TEXT NOT NULL,
    confidence NUMERIC NOT NULL DEFAULT 0.5,
    evidence_level TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (evidence_level IN ('HIGH', 'MEDIUM', 'LOW', 'SPECULATIVE')),
    market_specificity TEXT NOT NULL DEFAULT 'COMPANY_SPECIFIC' CHECK (market_specificity IN ('COMPANY_SPECIFIC', 'SECTOR_WIDE', 'MARKET_WIDE')),
    alternative_explanation TEXT,
    raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- INDEXES & PERFORMANCE OPTIMIZATIONS
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_daily_reports_trading_date ON public.daily_reports(trading_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_report_id ON public.stock_movements(report_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_symbol ON public.stock_movements(symbol);
CREATE INDEX IF NOT EXISTS idx_news_articles_movement_id ON public.news_articles(stock_movement_id);
CREATE INDEX IF NOT EXISTS idx_stock_analysis_movement_id ON public.stock_analysis(stock_movement_id);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Allow public read access to generated reports for dashboard viewing
-- ------------------------------------------------------------------------------
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to daily_reports" ON public.daily_reports FOR SELECT USING (true);
CREATE POLICY "Allow read access to stock_movements" ON public.stock_movements FOR SELECT USING (true);
CREATE POLICY "Allow read access to news_articles" ON public.news_articles FOR SELECT USING (true);
CREATE POLICY "Allow read access to stock_analysis" ON public.stock_analysis FOR SELECT USING (true);

-- Allow service role full write access
CREATE POLICY "Allow service role write access daily_reports" ON public.daily_reports FOR ALL USING (true);
CREATE POLICY "Allow service role write access stock_movements" ON public.stock_movements FOR ALL USING (true);
CREATE POLICY "Allow service role write access news_articles" ON public.news_articles FOR ALL USING (true);
CREATE POLICY "Allow service role write access stock_analysis" ON public.stock_analysis FOR ALL USING (true);
