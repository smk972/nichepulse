-- ==============================================================================
-- NICHEPULSE — Schéma Supabase / PostgreSQL
-- Généré pour le déploiement sur Supabase
-- ==============================================================================

CREATE TABLE countries (
	code VARCHAR(2) NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	region VARCHAR(50), 
	active BOOLEAN, 
	PRIMARY KEY (code)
);

CREATE TABLE platforms (
	id VARCHAR(20) NOT NULL, 
	name VARCHAR(50) NOT NULL, 
	active BOOLEAN, 
	PRIMARY KEY (id)
);

CREATE TABLE app_categories (
	id INTEGER NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	slug VARCHAR(100) NOT NULL, 
	description TEXT, 
	PRIMARY KEY (id), 
	UNIQUE (name), 
	UNIQUE (slug)
);

CREATE TABLE search_terms (
	id INTEGER NOT NULL, 
	"query" VARCHAR(255) NOT NULL, 
	category VARCHAR(100), 
	created_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE trends (
	id INTEGER NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	category VARCHAR(100) NOT NULL, 
	description TEXT, 
	trend_score FLOAT, 
	search_momentum FLOAT, 
	apps_count INTEGER, 
	breakout_count INTEGER, 
	is_emerging BOOLEAN, 
	platform VARCHAR(20), 
	sparkline_data JSON, 
	created_at TIMESTAMP WITH TIME ZONE, 
	updated_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE pain_points (
	id INTEGER NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	category VARCHAR(50) NOT NULL, 
	frequency_pct FLOAT, 
	severity_score FLOAT, 
	pain_score FLOAT, 
	growth_trend FLOAT, 
	platform VARCHAR(20), 
	affected_apps JSON, 
	sample_verbatims JSON, 
	confidence FLOAT, 
	created_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE missing_features (
	id INTEGER NOT NULL, 
	feature_name VARCHAR(255) NOT NULL, 
	niche VARCHAR(100) NOT NULL, 
	requests_count INTEGER, 
	request_percentage FLOAT, 
	urgency_severity FLOAT, 
	affected_apps JSON, 
	opportunity_description TEXT, 
	created_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE competitors (
	id INTEGER NOT NULL, 
	niche VARCHAR(100) NOT NULL, 
	app_name VARCHAR(255) NOT NULL, 
	market_share_pct FLOAT, 
	rating FLOAT, 
	pricing_model VARCHAR(50), 
	weaknesses JSON, 
	created_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE market_gaps (
	id INTEGER NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	origin_country VARCHAR(2), 
	target_country VARCHAR(2), 
	origin_demand FLOAT, 
	origin_competition FLOAT, 
	target_demand FLOAT, 
	target_competition FLOAT, 
	gap_score FLOAT, 
	platform VARCHAR(20), 
	description TEXT, 
	recommended_action TEXT, 
	created_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE opportunities (
	id INTEGER NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	niche VARCHAR(100) NOT NULL, 
	target_country VARCHAR(2), 
	platform VARCHAR(20), 
	search_demand_score FLOAT, 
	momentum_score FLOAT, 
	market_gap_score FLOAT, 
	pain_score FLOAT, 
	competition_score FLOAT, 
	easy_build_score FLOAT, 
	opportunity_score FLOAT, 
	build_score FLOAT, 
	status VARCHAR(20), 
	confidence_score FLOAT, 
	mvp_days VARCHAR(20), 
	complexity_score FLOAT, 
	estimated_arpu VARCHAR(50), 
	summary TEXT NOT NULL, 
	source_signals JSON, 
	created_at TIMESTAMP WITH TIME ZONE, 
	updated_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE app_ideas (
	id INTEGER NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	tagline VARCHAR(255), 
	target_user VARCHAR(255) NOT NULL, 
	problem_solved TEXT NOT NULL, 
	platform VARCHAR(20), 
	mvp_features JSON, 
	differentiation TEXT NOT NULL, 
	why_now TEXT NOT NULL, 
	competitors JSON, 
	risks JSON, 
	technical_complexity FLOAT, 
	mvp_estimate_days VARCHAR(50), 
	opportunity_score FLOAT, 
	build_score FLOAT, 
	status VARCHAR(20), 
	kill_analysis JSON, 
	is_bookmarked BOOLEAN, 
	created_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE watchlists (
	id INTEGER NOT NULL, 
	item_type VARCHAR(50) NOT NULL, 
	item_id VARCHAR(100) NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	notes TEXT, 
	initial_metric FLOAT, 
	current_metric FLOAT, 
	created_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE alerts (
	id INTEGER NOT NULL, 
	type VARCHAR(50) NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	message TEXT NOT NULL, 
	severity VARCHAR(20), 
	metadata_json JSON, 
	is_read BOOLEAN, 
	created_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE data_sources (
	id VARCHAR(50) NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	status VARCHAR(20), 
	last_sync TIMESTAMP WITH TIME ZONE, 
	records_count INTEGER, 
	last_error TEXT, 
	response_time_ms INTEGER, 
	updated_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE analysis_runs (
	id INTEGER NOT NULL, 
	run_type VARCHAR(50) NOT NULL, 
	model VARCHAR(50), 
	prompt_version VARCHAR(20), 
	analysis_hash VARCHAR(64), 
	status VARCHAR(20), 
	duration_seconds FLOAT, 
	records_processed INTEGER, 
	created_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE apps (
	id VARCHAR(100) NOT NULL, 
	bundle_id VARCHAR(255) NOT NULL, 
	platform VARCHAR(20) NOT NULL, 
	country VARCHAR(2) NOT NULL, 
	category VARCHAR(100) NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	developer VARCHAR(255) NOT NULL, 
	icon_url VARCHAR(500), 
	description TEXT, 
	price FLOAT, 
	has_in_app_purchases BOOLEAN, 
	rating FLOAT, 
	review_count INTEGER, 
	current_rank INTEGER, 
	is_breakout BOOLEAN, 
	is_new BOOLEAN, 
	is_demo BOOLEAN, 
	created_at TIMESTAMP WITH TIME ZONE, 
	updated_at TIMESTAMP WITH TIME ZONE, downloads_count INTEGER DEFAULT 50000, downloads_growth VARCHAR(50) DEFAULT '+18.5% ce mois', downloads_growth_weekly INTEGER DEFAULT 4500, subscription_price VARCHAR(100) DEFAULT '4,99 €/mois', company_name VARCHAR(255), company_country VARCHAR(50) DEFAULT 'US', company_type VARCHAR(100) DEFAULT 'Studio Indépendant', release_date VARCHAR(20), functional_summary TEXT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(platform) REFERENCES platforms (id), 
	FOREIGN KEY(country) REFERENCES countries (code)
);

CREATE TABLE search_metrics (
	id INTEGER NOT NULL, 
	search_term_id INTEGER NOT NULL, 
	country VARCHAR(2) NOT NULL, 
	relative_demand_score FLOAT, 
	estimated_volume INTEGER, 
	growth_24h FLOAT, 
	growth_7d FLOAT, 
	growth_30d FLOAT, 
	recorded_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(search_term_id) REFERENCES search_terms (id)
);

CREATE TABLE idea_scores (
	id INTEGER NOT NULL, 
	idea_id INTEGER NOT NULL, 
	score_type VARCHAR(50) NOT NULL, 
	value FLOAT NOT NULL, 
	calculation_details JSON, 
	recorded_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(idea_id) REFERENCES app_ideas (id)
);

CREATE TABLE app_rankings (
	id INTEGER NOT NULL, 
	app_id VARCHAR(100) NOT NULL, 
	date VARCHAR(10) NOT NULL, 
	country VARCHAR(2) NOT NULL, 
	platform VARCHAR(20) NOT NULL, 
	category VARCHAR(100) NOT NULL, 
	rank INTEGER NOT NULL, 
	rating FLOAT, 
	review_count INTEGER, 
	created_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(app_id) REFERENCES apps (id)
);

CREATE TABLE app_reviews (
	id VARCHAR(100) NOT NULL, 
	app_id VARCHAR(100) NOT NULL, 
	date TIMESTAMP WITH TIME ZONE NOT NULL, 
	rating INTEGER NOT NULL, 
	title VARCHAR(255), 
	text TEXT NOT NULL, 
	language VARCHAR(10), 
	sentiment VARCHAR(20), 
	classified_category VARCHAR(50), 
	has_pain_point BOOLEAN, 
	has_missing_feature BOOLEAN, 
	is_demo BOOLEAN, 
	created_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(app_id) REFERENCES apps (id)
);

CREATE TABLE app_features (
	id INTEGER NOT NULL, 
	app_id VARCHAR(100) NOT NULL, 
	name VARCHAR(255) NOT NULL, 
	description TEXT, 
	is_core BOOLEAN, 
	created_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(app_id) REFERENCES apps (id)
);

CREATE TABLE app_review_embeddings (
	id INTEGER NOT NULL, 
	review_id VARCHAR(100) NOT NULL, 
	vector JSON NOT NULL, 
	model VARCHAR(50), 
	cluster_id INTEGER, 
	created_at TIMESTAMP WITH TIME ZONE, 
	PRIMARY KEY (id), 
	UNIQUE (review_id), 
	FOREIGN KEY(review_id) REFERENCES app_reviews (id)
);

