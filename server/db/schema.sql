-- ============================================================
-- LTO TRAFFIC VIOLATION SYSTEM - DATABASE SCHEMA
-- ============================================================

-- 1. Driver Table
CREATE TABLE IF NOT EXISTS driver (
    license_number    VARCHAR(20)  PRIMARY KEY,
    full_name         VARCHAR(100) NOT NULL,
    sex               VARCHAR(10)  NOT NULL,
    license_status    VARCHAR(20)  NOT NULL DEFAULT 'Valid'
                          CHECK (license_status IN ('Valid', 'Expired', 'Suspended', 'Revoked')),
    license_type      VARCHAR(30)  NOT NULL
                          CHECK (license_type IN ('Student Permit', 'Non-Professional', 'Professional')),
    issuance_date     DATE,
    expiration_date   DATE         NOT NULL,
    date_of_birth     DATE         NOT NULL,
    address           VARCHAR(255) NOT NULL
);

-- 2. Vehicle Table
CREATE TABLE IF NOT EXISTS vehicle (
    plate_number    VARCHAR(15)  PRIMARY KEY,
    engine_number   VARCHAR(50)  NOT NULL,
    chassis_number  VARCHAR(50)  NOT NULL,
    color           VARCHAR(30)  NOT NULL,
    make            VARCHAR(50)  NOT NULL,
    model           VARCHAR(50)  NOT NULL,
    year            INTEGER      NOT NULL,
    vehicle_type    VARCHAR(30)  NOT NULL,
    license_number  VARCHAR(20)  REFERENCES driver(license_number) ON DELETE CASCADE
);

-- 3. Vehicle Registration Table
CREATE TABLE IF NOT EXISTS vehicle_registration (
    registration_number  VARCHAR(50)  PRIMARY KEY,
    plate_number         VARCHAR(15)  NOT NULL REFERENCES vehicle(plate_number) ON DELETE CASCADE,
    registration_date    DATE         NOT NULL,
    expiration_date      DATE         NOT NULL,
    registration_status  VARCHAR(20)  NOT NULL DEFAULT 'Active'
                             CHECK (registration_status IN ('Active', 'Expired', 'Suspended'))
);

-- 4. Violation Table
CREATE TABLE IF NOT EXISTS violation (
    violation_id              SERIAL       PRIMARY KEY,
    date                      DATE         NOT NULL,
    location                  VARCHAR(100) NOT NULL,
    corresponding_fine_amount DECIMAL(10,2) NOT NULL,
    apprehending_officer      VARCHAR(100),
    violation_status          VARCHAR(20)  NOT NULL DEFAULT 'Unpaid'
                                  CHECK (violation_status IN ('Unpaid', 'Paid', 'Contested')),
    license_number            VARCHAR(20)  REFERENCES driver(license_number) ON DELETE CASCADE,
    plate_number              VARCHAR(15)  REFERENCES vehicle(plate_number) ON DELETE CASCADE
);

-- 5. Violation Type Table
CREATE TABLE IF NOT EXISTS violation_type (
    violation_id    INTEGER      NOT NULL REFERENCES violation(violation_id) ON DELETE CASCADE,
    violation_type  VARCHAR(100) NOT NULL,
    PRIMARY KEY (violation_id, violation_type)
);