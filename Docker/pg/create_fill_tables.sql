--1 COMPANIES CATALOGUE

create sequence companies_id_seq;

alter sequence companies_id_seq owner to postgres;

SELECT setval('companies_id_seq', 2, true);

create table companies_catalogue
(
    id   bigint default nextval('companies_id_seq'::regclass) not null
        constraint companies_pk
            primary key,
    name varchar(255)                                         not null
);

alter table companies_catalogue
    owner to postgres;

create unique index companies_id_uindex
    on companies_catalogue (id);

INSERT INTO public.companies_catalogue (id, name) VALUES (1, 'Big company');
INSERT INTO public.companies_catalogue (id, name) VALUES (2, 'The company');


--2 USERS
create sequence users_id_seq;

alter sequence users_id_seq owner to postgres;

SELECT setval('users_id_seq', 5, true);

create table users
(
    id         bigint  default nextval('users_id_seq'::regclass)            not null
        constraint users_pk
            primary key,
    email      varchar(255)                                                  not null,
    password   varchar(255)                                                  not null,
    roles      varchar(1024)                                                 not null,
    active     boolean default true                                          not null,
    company_id bigint
        constraint users_companies_catalogue_id_fk
            references companies_catalogue
            on update cascade on delete cascade,
    created_at bigint  default (EXTRACT(epoch FROM now()) * (1000)::numeric) not null,
    created_by varchar(255)                                                  not null,
    surname    varchar(255),
    name       varchar(255)
);

alter table users
    owner to postgres;

create unique index users_email_uindex
    on users (email);

create unique index users_id_uindex
    on users (id);

INSERT INTO public.users (id, email, password, roles, active, company_id, created_at, created_by, surname, name) VALUES (2, 'mariodeda2@hotmail.com', '$2b$10$MHhjGHz7OPL6JY3/VwZuEOetPCAbvotpxn.jaxDl0CYiO9iYSLnJa', 'COMPANY_ROLE_WORKER', true, 1, 1669996625020, '5', 'Account', 'Test');
INSERT INTO public.users (id, email, password, roles, active, company_id, created_at, created_by, surname, name) VALUES (5, 'mariodeda@hotmail.com', '$2b$10$ASmkHx7yzmYppuKQOswQp.Cdi1d/kRXub4qc6lFVndNVctrXyqo.q', 'COMPANY_ROLE_ADMIN', true, 1, 1665073565677, 'web-portal', 'Deda', 'Mario');
INSERT INTO public.users (id, email, password, roles, active, company_id, created_at, created_by, surname, name) VALUES (4, 'test2@hotmail.com', '$2b$10$LE8MsVIdpIVAGmBv1R.RtOowzQAyagpgvhGOnslePrrCSPpXwBrOa', 'COMPANY_ROLE_WORKER', true, 1, 1670346982846, '2', 'Account 2', 'Test');
INSERT INTO public.users (id, email, password, roles, active, company_id, created_at, created_by, surname, name) VALUES (3, 'worker@hotmail.com', '$2b$10$LE8MsVIdpIVAGmBv1R.RtOowzQAyagpgvhGOnslePrrCSPpXwBrOa', 'COMPANY_ROLE_WORKER,COMPANY_ROLE_MANAGER', true, 1, 1670346704392, '2', 'Account', 'Worker');


--3 MACHINERIES CATALOGUE
create table machineries_catalogue
(
    model_id varchar(255) not null
        constraint machineries_catalogue_pk
            primary key,
    name     varchar(255) not null,
    type     varchar(255) not null
);

alter table machineries_catalogue
    owner to postgres;

create unique index machineries_catalogue_model_id_uindex
    on machineries_catalogue (model_id);

INSERT INTO public.machineries_catalogue (model_id, name, type) VALUES ('EUPK-FB', 'Euro PK Flat Buffer', 'Tappatore');
INSERT INTO public.machineries_catalogue (model_id, name, type) VALUES ('EM', 'Elevatore Meccanico', 'Elevatore capsule');
INSERT INTO public.machineries_catalogue (model_id, name, type) VALUES ('EQUA', 'Equatorque PK', 'Tappatore');


--4 COMPANY-MACHINERIES
create table company_machineries
(
    machinery_uid      varchar(255)      not null
        constraint company_machineries_pk
            primary key,
    machinery_model_id varchar(255)      not null
        constraint company_machineries_machineries_catalogue_model_id_fk
            references machineries_catalogue
            on update cascade on delete cascade,
    company_id         bigint            not null
        constraint company_machineries_companies_catalogue_id_fk
            references companies_catalogue
            on update cascade on delete cascade,
    geo_location       point             not null,
    location_cluster   varchar(255)      not null,
    num_heads          integer default 1 not null
);

alter table company_machineries
    owner to postgres;

create unique index company_machineries_machinery_uid_uindex
    on company_machineries (machinery_uid);

INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('XB056', 'EM', 1, '(45.013658,7.618732)', 'Mirafiori Sud, Torino', 1);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('XB098', 'EM', 1, '(44.729519,8.296058)', 'Canelli, Asti', 1);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('JF893', 'EQUA', 1, '(44.729826,8.295413)', 'Canelli, Asti', 24);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('JF890', 'EQUA', 1, '(45.014035,7.6194)', 'Mirafiori Sud, Torino', 24);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('WM100', 'EUPK-FB', 1, '(45.013674,7.620022)', 'Mirafiori Sud, Torino', 24);
INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ('JF891', 'EQUA', 1, '(45.013505,7.619129)', 'Mirafiori Sud, Torino', 24);



--5 MACHINERY SENSORS
create table machinery_sensors
(
    machinery_uid               varchar(255)          not null
        constraint machinery_sensors_company_machineries_null_fk
            references company_machineries,
    sensor_name                 varchar(255)          not null,
    sensor_description          varchar(2048)         not null,
    sensor_unit                 varchar(255)          not null,
    sensor_threshold_low        double precision,
    sensor_threshold_high       double precision,
    sensor_internal_name        varchar(255)          not null,
    sensor_category             varchar(255)          not null,
    sensor_type                 varchar(255)          not null,
    sensor_img_filename         varchar(255),
    sensor_img_pointer_location point,
    sensor_bucketing_type       varchar(64)           not null,
    sensor_is_head_mounted      boolean default false not null
);

alter table machinery_sensors
    owner to postgres;

create index machinery_sensors_machinery_model_id_index
    on machinery_sensors (machinery_uid);

INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Average Friction', 'Description', 'Newton', null, null, 'AverageFriction', 'eqtq', 'operational', null, null, 'average', true);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Maximum Lock Position', 'Description', 'Degrees', null, null, 'MaxLockPosition', 'eqtq', 'operational', null, null, 'max', true);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Minumum Lock Position', 'Description', 'Degrees', null, null, 'MinLockPosition', 'eqtq', 'operational', null, null, 'min', true);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Average Torque', 'Description', 'N•m', null, null, 'AverageTorque', 'eqtq', 'operational', null, null, 'average', true);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Bad Closure Status', 'Description', 'Units', null, null, 'stsBadClosure', 'eqtq', 'operational', null, null, 'max', true);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Current', 'Description', 'Amperes', null, null, 'PowerCurrent', 'plc', 'status', null, null, 'average', false);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Main Motor Current', 'Description', 'Amperes', null, null, 'MainMotorCurrent', 'plc', 'status', null, null, 'average', false);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Voltage', 'Description', 'Volts', null, null, 'PowerVoltage', 'plc', 'status', null, null, 'average', false);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Head Motor Current', 'Description', 'Amperes', null, null, 'HeadMotorCurrent', 'plc', 'status', null, null, 'average', false);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Operation State', 'Description', 'Status', null, null, 'OperationState', 'plc', 'status', null, null, 'majority', false);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Main Motor Speed', 'Description', 'RPM', null, null, 'MainMotorSpeed', 'plc', 'status', null, null, 'average', false);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Lubricant Level', 'Description', 'Litres', null, null, 'LubeLevel', 'plc', 'status', null, null, 'average', false);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Air Consumption', 'Description', 'Litres/second', null, null, 'AirConsumption', 'plc', 'status', null, null, 'average', false);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Total Product', 'Description', 'Total Units', null, null, 'TotalProduct', 'plc', 'status', null, null, 'max', false);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Production Speed', 'Description', 'Units/hour', null, null, 'ProdSpeed', 'plc', 'status', null, null, 'average', false);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Operation Mode', 'Description', 'Status', null, null, 'OperationMode', 'plc', 'status', null, null, 'majority', false);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Head Motor Speed', 'Description', 'RPM', null, null, 'HeadMotorSpeed', 'plc', 'status', null, null, 'average', false);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Test 2', 'Description', 'Units', null, null, 'test2', 'plc', 'status', null, null, 'max', false);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Alarm', 'Description', 'Status', null, null, 'Alarm', 'plc', 'status', null, null, 'majority', false);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Test 1', 'Description', 'Units', null, null, 'test1', 'plc', 'status', null, null, 'max', false);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Test 3', 'Description', 'Units', null, null, 'test3', 'plc', 'status', null, null, 'max', false);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'CPU Temperature', 'Description', 'Celsius', null, null, 'Tcpu', 'drive', 'temperature', null, null, 'average', true);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Total Count Status', 'Description', 'Units', null, null, 'stsTotalCount', 'eqtq', 'operational', null, null, 'max', true);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Board Temperature', 'Description', 'Celsius', null, null, 'Tboard', 'drive', 'temperature', null, null, 'average', true);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Windings Temperature', 'Description', 'Celsius', null, null, 'Twindings', 'drive', 'temperature', null, null, 'average', true);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'OK Closure Status', 'Description', 'Units', null, null, 'stsClosureOK', 'eqtq', 'operational', null, null, 'max', true);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'Plate Temperature', 'Description', 'Celsius', null, null, 'Tplate', 'drive', 'temperature', null, null, 'average', true);
INSERT INTO public.machinery_sensors (machinery_uid, sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type, sensor_is_head_mounted) VALUES ('JF891', 'No Load Status', 'Description', 'Units', null, null, 'stsNoLoad', 'eqtq', 'operational', null, null, 'max', true);

--6 REFRESH TOKEN
create table refresh_tokens
(
    user_id       bigint       not null
        constraint refresh_tokens_users_id_fk
            references users
            on update cascade on delete cascade,
    refresh_token varchar(255) not null,
    expiration    bigint       not null
);

alter table refresh_tokens
    owner to postgres;

create unique index refresh_tokens_refresh_token_uindex
    on refresh_tokens (refresh_token);

create index refresh_tokens_user_id_index
    on refresh_tokens (user_id);


--7 MACHINERY DOCUMENTS
create table machinery_documents
(
    machinery_uid          varchar(1024)                                                 not null
        constraint machinery_documents_company_machineries_machinery_uid_fk
            references company_machineries
            on update cascade on delete cascade,
    location               varchar(1024)                                                 not null,
    name                   varchar(1024)                                                 not null,
    is_dir                 boolean                                                       not null,
    is_document            boolean                                                       not null,
    document_uid           varchar(1024),
    creation_timestamp     bigint  default (EXTRACT(epoch FROM now()) * (1000)::numeric) not null,
    size_bytes             double precision                                              not null,
    created_by             integer                                                       not null,
    modification_timestamp bigint  default (EXTRACT(epoch FROM now()) * (1000)::numeric) not null,
    is_modifiable          boolean default true                                          not null,
    modified_by            integer                                                       not null,
    constraint machinery_documents_pk
        primary key (location, name)
);

alter table machinery_documents
    owner to postgres;

create unique index machinery_documents_document_uid_uindex
    on machinery_documents (document_uid);

--8 MACHINERY PERMISSIONS
create table machinery_permissions
(
    machinery_uid     varchar(255)          not null
        constraint machinery_permissions_company_machineries_null_fk
            references company_machineries,
    user_id           bigint                not null
        constraint machinery_permissions_users_null_fk
            references users,
    dashboards_write  boolean               not null,
    dashboards_modify boolean default false not null,
    dashboards_read   boolean default false not null,
    documents_write   boolean default false not null,
    documents_modify  boolean default false not null,
    documents_read    boolean default false not null,
    constraint machinery_permissions_pk
        primary key (machinery_uid, user_id)
);

alter table machinery_permissions
    owner to postgres;

INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF891', 5, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('XB056', 5, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF893', 5, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('WM100', 5, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('XB098', 5, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF890', 5, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF891', 2, true, true, true, false, false, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF891', 4, false, false, false, false, false, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('XB056', 4, false, false, false, false, false, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF890', 4, false, false, false, false, false, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('WM100', 2, false, false, false, false, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF890', 2, false, false, false, false, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('XB098', 4, false, false, false, false, false, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('WM100', 3, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('XB098', 3, true, true, true, true, true, true);
INSERT INTO public.machinery_permissions (machinery_uid, user_id, dashboards_write, dashboards_modify, dashboards_read, documents_write, documents_modify, documents_read) VALUES ('JF893', 3, true, true, true, true, true, true);

create sequence public.machinery_dashboards_id_seq1
    as integer;

alter sequence public.machinery_dashboards_id_seq1 owner to postgres;

create table machinery_dashboards
(
    id            integer default nextval('machinery_dashboards_id_seq1'::regclass) not null
        constraint machinery_dashboards_pk
            primary key,
    machinery_uid varchar(1024)                                                     not null
        constraint machinery_dashboards_company_machineries_machinery_uid_fk
            references company_machineries
            on update cascade on delete cascade,
    dashboard     jsonb                                                             not null
);

alter table machinery_dashboards
    owner to postgres;

alter sequence public.machinery_dashboards_id_seq1 owned by public.machinery_dashboards.id;

INSERT INTO public.machinery_dashboards (id, machinery_uid, dashboard) VALUES (3, 'JF890', '{"grid": {"layout": [{"h": 4, "i": "0", "w": 6, "x": 0, "y": 0, "moved": false, "static": false, "isDraggable": true}, {"h": 4, "i": "1", "w": 3, "x": 6, "y": 0, "moved": false, "static": false, "isDraggable": true}], "widgets": [{"id": "0", "name": "Line chart", "type": "line-chart", "static": false, "category": "multi-value", "maxSensors": 24, "sensorsMonitoring": {"sensors": {"plc": [], "eqtq": [], "drive": []}, "dataRange": {"unit": "sample", "amount": 15}, "requestType": "first-time", "aggregations": [{"name": "none", "color": "#A0AEC0"}], "widgetCategory": "multi-value", "newDataRequestMinTime": 0, "cacheDataRequestMaxTime": 0}}, {"id": "1", "name": "Thermostat", "type": "thermostat", "static": false, "category": "single-value", "maxSensors": 1, "sensorsMonitoring": {"sensors": {"plc": [], "eqtq": [], "drive": []}, "dataRange": {"unit": "sample", "amount": 15}, "requestType": "first-time", "aggregations": [{"name": "none", "color": "#A0AEC0"}], "widgetCategory": "single-value", "newDataRequestMinTime": 0, "cacheDataRequestMaxTime": 0}}]}, "name": "Dashboard Fri, Dec 23, 2022 22:52", "isNew": true, "userID": "5", "numCols": 12, "numRows": 4, "lastSave": 1671832371380, "isDefault": true, "timestamp": 1671832371380, "machineryUID": "JF890", "gridCompaction": "vertical", "numUnsavedChanges": 0}');
INSERT INTO public.machinery_dashboards (id, machinery_uid, dashboard) VALUES (4, 'JF891', '{"grid": {"layout": [{"h": 4, "i": "0", "w": 6, "x": 0, "y": 0, "moved": false, "static": false, "isDraggable": true}, {"h": 4, "i": "1", "w": 3, "x": 6, "y": 0, "moved": false, "static": false, "isDraggable": true}], "widgets": [{"id": "0", "name": "Line chart", "type": "line-chart", "static": false, "category": "multi-value", "maxSensors": 24, "sensorsMonitoring": {"sensors": {"plc": [], "eqtq": [], "drive": []}, "dataRange": {"unit": "sample", "amount": 15}, "requestType": "first-time", "aggregations": [{"name": "none", "color": "#A0AEC0"}], "widgetCategory": "multi-value", "newDataRequestMinTime": 0, "cacheDataRequestMaxTime": 0}}, {"id": "1", "name": "Thermostat", "type": "thermostat", "static": false, "category": "single-value", "maxSensors": 1, "sensorsMonitoring": {"sensors": {"plc": [], "eqtq": [], "drive": []}, "dataRange": {"unit": "sample", "amount": 15}, "requestType": "first-time", "aggregations": [{"name": "none", "color": "#A0AEC0"}], "widgetCategory": "single-value", "newDataRequestMinTime": 0, "cacheDataRequestMaxTime": 0}}]}, "name": "Dashboard Fri, Dec 23, 2022 22:53", "isNew": true, "userID": "5", "numCols": 12, "numRows": 4, "lastSave": 1671832390657, "isDefault": false, "timestamp": 1671832390658, "machineryUID": "JF891", "gridCompaction": "vertical", "numUnsavedChanges": 0}');
INSERT INTO public.machinery_dashboards (id, machinery_uid, dashboard) VALUES (1, 'JF891', '{"grid": {"layout": [{"h": 4, "i": "0", "w": 8, "x": 1, "y": 0, "moved": false, "static": false, "isDraggable": true}], "widgets": [{"id": "0", "name": "Area chart", "type": "area-chart", "static": false, "category": "multi-value", "maxSensors": 24, "sensorsMonitoring": {"sensors": {"plc": [], "eqtq": [], "drive": []}, "dataRange": {"unit": "sample", "amount": 15}, "requestType": "first-time", "aggregations": [{"name": "none", "color": "#A0AEC0"}], "newDataRequestMinTime": 0, "cacheDataRequestMaxTime": 0}}]}, "name": "Dashboard Fri, Jul 21, 2023 18:34", "isNew": true, "userID": "2", "numCols": 12, "numRows": 4, "lastSave": 1689957273063, "isDefault": false, "timestamp": 1689957273064, "machineryUID": "JF891", "gridCompaction": "vertical", "numUnsavedChanges": 0}');
INSERT INTO public.machinery_dashboards (id, machinery_uid, dashboard) VALUES (2, 'JF891', '{"grid": {"layout": [{"h": 5, "i": "0", "w": 7, "x": 0, "y": 0, "moved": false, "static": false, "isDraggable": true}, {"h": 4, "i": "1", "w": 3, "x": 7, "y": 0, "moved": false, "static": false, "isDraggable": true}, {"h": 4, "i": "2", "w": 8, "x": 0, "y": 8, "moved": false, "static": false, "isDraggable": true}, {"h": 3, "i": "3", "w": 5, "x": 0, "y": 5, "moved": false, "static": false, "isDraggable": true}], "widgets": [{"id": "0", "name": "Line chart", "type": "line-chart", "static": false, "category": "multi-value", "maxSensors": 24, "sensorsMonitoring": {"sensors": {"plc": [], "eqtq": [], "drive": [{"headNumber": 1, "sensorNames": [{"name": "Twindings", "color": "#b4ddd4"}]}, {"headNumber": 2, "sensorNames": [{"name": "Twindings", "color": "#194f46"}]}, {"headNumber": 3, "sensorNames": [{"name": "Twindings", "color": "#5ddcb2"}]}, {"headNumber": 4, "sensorNames": [{"name": "Twindings", "color": "#528f7a"}]}, {"headNumber": 5, "sensorNames": [{"name": "Twindings", "color": "#a0e85b"}]}, {"headNumber": 6, "sensorNames": [{"name": "Twindings", "color": "#799d10"}]}, {"headNumber": 7, "sensorNames": [{"name": "Twindings", "color": "#dada69"}]}, {"headNumber": 8, "sensorNames": [{"name": "Twindings", "color": "#73482b"}]}, {"headNumber": 9, "sensorNames": [{"name": "Twindings", "color": "#f48e9b"}]}, {"headNumber": 10, "sensorNames": [{"name": "Twindings", "color": "#922d4c"}]}, {"headNumber": 11, "sensorNames": [{"name": "Twindings", "color": "#fb2076"}]}, {"headNumber": 12, "sensorNames": [{"name": "Twindings", "color": "#f97930"}]}, {"headNumber": 13, "sensorNames": [{"name": "Twindings", "color": "#a93705"}]}, {"headNumber": 14, "sensorNames": [{"name": "Twindings", "color": "#36f459"}]}, {"headNumber": 15, "sensorNames": [{"name": "Twindings", "color": "#21a708"}]}, {"headNumber": 16, "sensorNames": [{"name": "Twindings", "color": "#048ad1"}]}, {"headNumber": 17, "sensorNames": [{"name": "Twindings", "color": "#3330b7"}]}, {"headNumber": 18, "sensorNames": [{"name": "Twindings", "color": "#8872e4"}]}, {"headNumber": 19, "sensorNames": [{"name": "Twindings", "color": "#e26df8"}]}, {"headNumber": 20, "sensorNames": [{"name": "Twindings", "color": "#49406e"}]}, {"headNumber": 21, "sensorNames": [{"name": "Twindings", "color": "#7220f6"}]}, {"headNumber": 22, "sensorNames": [{"name": "Twindings", "color": "#ffb947"}]}, {"headNumber": 23, "sensorNames": [{"name": "Twindings", "color": "#ed0e1c"}]}, {"headNumber": 24, "sensorNames": [{"name": "Twindings", "color": "#a28b91"}]}]}, "dataRange": {"unit": "sample", "amount": 15}, "requestType": "first-time", "aggregations": [], "widgetCategory": "multi-value", "newDataRequestMinTime": 0, "cacheDataRequestMaxTime": 0}}, {"id": "1", "name": "Thermostat 1", "type": "thermostat", "static": false, "category": "single-value", "maxSensors": 1, "sensorsMonitoring": {"sensors": {"plc": [], "eqtq": [{"headNumber": 1, "sensorNames": [{"name": "AverageTorque", "color": "#b4ddd4"}]}], "drive": []}, "dataRange": {"unit": "sample", "amount": 1}, "requestType": "first-time", "aggregations": [], "widgetCategory": "single-value", "newDataRequestMinTime": 0, "cacheDataRequestMaxTime": 0}}, {"id": "2", "name": "Bar chart", "type": "bar-chart", "static": false, "category": "multi-value", "maxSensors": 24, "sensorsMonitoring": {"sensors": {"plc": [], "eqtq": [{"headNumber": 1, "sensorNames": [{"name": "stsClosureOK", "color": "#b4ddd4"}]}, {"headNumber": 2, "sensorNames": [{"name": "stsClosureOK", "color": "#194f46"}]}, {"headNumber": 3, "sensorNames": [{"name": "stsClosureOK", "color": "#5ddcb2"}]}, {"headNumber": 4, "sensorNames": [{"name": "stsClosureOK", "color": "#528f7a"}]}, {"headNumber": 5, "sensorNames": [{"name": "stsClosureOK", "color": "#a0e85b"}]}, {"headNumber": 6, "sensorNames": [{"name": "stsClosureOK", "color": "#799d10"}]}, {"headNumber": 7, "sensorNames": [{"name": "stsClosureOK", "color": "#dada69"}]}, {"headNumber": 8, "sensorNames": [{"name": "stsClosureOK", "color": "#73482b"}]}, {"headNumber": 9, "sensorNames": [{"name": "stsClosureOK", "color": "#f48e9b"}]}, {"headNumber": 10, "sensorNames": [{"name": "stsClosureOK", "color": "#922d4c"}]}, {"headNumber": 11, "sensorNames": [{"name": "stsClosureOK", "color": "#fb2076"}]}, {"headNumber": 12, "sensorNames": [{"name": "stsClosureOK", "color": "#f97930"}]}, {"headNumber": 13, "sensorNames": [{"name": "stsClosureOK", "color": "#a93705"}]}, {"headNumber": 14, "sensorNames": [{"name": "stsClosureOK", "color": "#36f459"}]}, {"headNumber": 15, "sensorNames": [{"name": "stsClosureOK", "color": "#21a708"}]}, {"headNumber": 16, "sensorNames": [{"name": "stsClosureOK", "color": "#048ad1"}]}, {"headNumber": 17, "sensorNames": [{"name": "stsClosureOK", "color": "#3330b7"}]}, {"headNumber": 18, "sensorNames": [{"name": "stsClosureOK", "color": "#8872e4"}]}, {"headNumber": 19, "sensorNames": [{"name": "stsClosureOK", "color": "#e26df8"}]}, {"headNumber": 20, "sensorNames": [{"name": "stsClosureOK", "color": "#49406e"}]}, {"headNumber": 21, "sensorNames": [{"name": "stsClosureOK", "color": "#7220f6"}]}, {"headNumber": 22, "sensorNames": [{"name": "stsClosureOK", "color": "#ffb947"}]}, {"headNumber": 23, "sensorNames": [{"name": "stsClosureOK", "color": "#ed0e1c"}]}, {"headNumber": 24, "sensorNames": [{"name": "stsClosureOK", "color": "#a28b91"}]}], "drive": []}, "dataRange": {"unit": "sample", "amount": 15}, "requestType": "first-time", "aggregations": [], "widgetCategory": "multi-value", "newDataRequestMinTime": 0, "cacheDataRequestMaxTime": 0}}, {"id": "3", "name": "Area chart", "type": "area-chart", "static": false, "category": "multi-value", "maxSensors": 24, "sensorsMonitoring": {"sensors": {"plc": [], "eqtq": [{"headNumber": 1, "sensorNames": [{"name": "AverageFriction", "color": "#b4ddd4"}]}, {"headNumber": 2, "sensorNames": [{"name": "AverageFriction", "color": "#194f46"}]}, {"headNumber": 3, "sensorNames": [{"name": "AverageFriction", "color": "#5ddcb2"}]}, {"headNumber": 4, "sensorNames": [{"name": "AverageFriction", "color": "#528f7a"}]}, {"headNumber": 5, "sensorNames": [{"name": "AverageFriction", "color": "#a0e85b"}]}, {"headNumber": 6, "sensorNames": [{"name": "AverageFriction", "color": "#799d10"}]}, {"headNumber": 7, "sensorNames": [{"name": "AverageFriction", "color": "#dada69"}]}, {"headNumber": 8, "sensorNames": [{"name": "AverageFriction", "color": "#73482b"}]}, {"headNumber": 9, "sensorNames": [{"name": "AverageFriction", "color": "#f48e9b"}]}, {"headNumber": 10, "sensorNames": [{"name": "AverageFriction", "color": "#922d4c"}]}, {"headNumber": 11, "sensorNames": [{"name": "AverageFriction", "color": "#fb2076"}]}, {"headNumber": 12, "sensorNames": [{"name": "AverageFriction", "color": "#f97930"}]}, {"headNumber": 13, "sensorNames": [{"name": "AverageFriction", "color": "#a93705"}]}, {"headNumber": 14, "sensorNames": [{"name": "AverageFriction", "color": "#36f459"}]}, {"headNumber": 15, "sensorNames": [{"name": "AverageFriction", "color": "#21a708"}]}, {"headNumber": 16, "sensorNames": [{"name": "AverageFriction", "color": "#048ad1"}]}, {"headNumber": 17, "sensorNames": [{"name": "AverageFriction", "color": "#3330b7"}]}, {"headNumber": 18, "sensorNames": [{"name": "AverageFriction", "color": "#8872e4"}]}, {"headNumber": 19, "sensorNames": [{"name": "AverageFriction", "color": "#e26df8"}]}, {"headNumber": 20, "sensorNames": [{"name": "AverageFriction", "color": "#49406e"}]}, {"headNumber": 21, "sensorNames": [{"name": "AverageFriction", "color": "#7220f6"}]}, {"headNumber": 22, "sensorNames": [{"name": "AverageFriction", "color": "#ffb947"}]}, {"headNumber": 23, "sensorNames": [{"name": "AverageFriction", "color": "#ed0e1c"}]}, {"headNumber": 24, "sensorNames": [{"name": "AverageFriction", "color": "#a28b91"}]}], "drive": []}, "dataRange": {"unit": "sample", "amount": 15}, "requestType": "first-time", "aggregations": [], "widgetCategory": "multi-value", "newDataRequestMinTime": 0, "cacheDataRequestMaxTime": 0}}]}, "name": "Dashboard", "isNew": true, "userID": "5", "numCols": 12, "numRows": 13, "lastSave": 1689957139596, "isDefault": false, "timestamp": 1689957139596, "machineryUID": "JF891", "gridCompaction": "vertical", "numUnsavedChanges": 0}');





