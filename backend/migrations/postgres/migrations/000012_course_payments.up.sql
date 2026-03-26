CREATE TYPE "ShoppingCartItemDestination" AS ENUM (
    'CurrentUser',
    'Gift'
);
CREATE TABLE shopping_carts (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE shopping_cart_items (
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    shopping_cart_id BIGINT NOT NULL REFERENCES shopping_carts(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    destination "ShoppingCartItemDestination" NOT NULL DEFAULT 'CurrentUser',

    PRIMARY KEY (shopping_cart_id, course_id, destination)
);






CREATE TYPE "OrderStatus" AS ENUM (
    'Pending',      -- Order created but not yet paid
    'Paid',         -- Payment successful
    'Cancelled',    -- Order cancelled by user or system
    'Refunded',     -- Full refund issued
    'PartiallyRefunded' -- Partial refund issued
);

CREATE TYPE "PaymentStatus" AS ENUM (
    'Pending',      -- Initial state, waiting for confirmation
    'Succeeded',    -- Payment successful
    'Failed',       -- Payment failed (e.g., insufficient funds)
    'Refunded',     -- Payment fully refunded
    'PartiallyRefunded' -- Payment partially refunded
);

CREATE TYPE "PaymentProvider" AS ENUM (
    'Stripe'
);

-- Enums from stripe
CREATE TYPE "CardFunding" AS ENUM (
    'credit', 
    'debit',
    'prepaid',
    'unknown'
);

CREATE TYPE "CardBrand" AS ENUM (
    'amex',
    'diners',
    'discover',
    'jcb',
    'mastercard',
    'unionpay',
    'unknown',
    'visa'
);


CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_amount INT NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(5) NOT NULL,
    status "OrderStatus" NOT NULL DEFAULT 'Pending',
    paid_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    destination "ShoppingCartItemDestination" NOT NULL DEFAULT 'CurrentUser',
    discount_percent_per_unit INT NOT NULL,
    unit_price INT NOT NULL,
    total_price INT NOT NULL,

    CONSTRAINT order_items_price_positive CHECK (unit_price >= 0 AND total_price >= 0)
);

CREATE TABLE payment_methods (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider "PaymentProvider" NOT NULL,
    token TEXT NOT NULL,                         -- Encrypted token from payment gateway
    last_four VARCHAR(4),                        -- Last 4 digits of card (if card)
    expiry_month SMALLINT,                        -- 1-12, if applicable
    expiry_year SMALLINT,                         -- e.g., 2025, if applicable
    cardholder_name VARCHAR(100),
    card_brand "CardBrand",
    card_funding "CardFunding",
    method_type VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    bank_name VARCHAR(100),
    bank_code VARCHAR(20),
    account_type VARCHAR(20),
    country VARCHAR(2),

    is_default BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT payment_methods_expiry_month_check CHECK (expiry_month BETWEEN 1 AND 12)
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(user_id, is_default) WHERE is_default = true;


CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method_id BIGINT REFERENCES payment_methods(id) ON DELETE SET NULL,
    provider "PaymentProvider",
    provider_transaction_id VARCHAR(255),
    amount INT NOT NULL,
    currency VARCHAR(5) NOT NULL,
    status "PaymentStatus" NOT NULL DEFAULT 'Pending',
    error_message TEXT,
    refunded_amount INT NOT NULL DEFAULT 0

    CONSTRAINT payments_amount_positive CHECK (amount > 0),
    CONSTRAINT payments_refunded_amount_check CHECK (refunded_amount >= 0 AND refunded_amount <= amount)
);

CREATE TABLE course_gift_codes (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL UNIQUE,
    redeemed_at TIMESTAMP,
    redeemed_by BIGINT REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE course_purchases (
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

    PRIMARY KEY (user_id, course_id)
);

