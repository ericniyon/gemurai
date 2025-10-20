-- Create Rwanda Administrative Divisions Tables

-- Provinces table
CREATE TABLE IF NOT EXISTS provinces (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Districts table
CREATE TABLE IF NOT EXISTS districts (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    province_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE CASCADE,
    UNIQUE(name, province_id)
);

-- Sectors table
CREATE TABLE IF NOT EXISTS sectors (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    district_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
    UNIQUE(name, district_id)
);

-- Cells table
CREATE TABLE IF NOT EXISTS cells (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sector_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE CASCADE,
    UNIQUE(name, sector_id)
);

-- Villages table
CREATE TABLE IF NOT EXISTS villages (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cell_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cell_id) REFERENCES cells(id) ON DELETE CASCADE,
    UNIQUE(name, cell_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_districts_province_id ON districts(province_id);
CREATE INDEX IF NOT EXISTS idx_sectors_district_id ON sectors(district_id);
CREATE INDEX IF NOT EXISTS idx_cells_sector_id ON cells(sector_id);
CREATE INDEX IF NOT EXISTS idx_villages_cell_id ON villages(cell_id);

-- Insert Provinces
INSERT INTO provinces (id, name) VALUES
('kigali', 'Kigali City'),
('eastern', 'Eastern Province'),
('northern', 'Northern Province'),
('southern', 'Southern Province'),
('western', 'Western Province')
ON CONFLICT (id) DO NOTHING;

-- Insert Districts for Kigali City
INSERT INTO districts (id, name, province_id) VALUES
('gasabo', 'Gasabo', 'kigali'),
('kicukiro', 'Kicukiro', 'kigali'),
('nyarugenge', 'Nyarugenge', 'kigali')
ON CONFLICT (id) DO NOTHING;

-- Insert Districts for Eastern Province
INSERT INTO districts (id, name, province_id) VALUES
('nyagatare', 'Nyagatare', 'eastern')
ON CONFLICT (id) DO NOTHING;

-- Insert Districts for Northern Province
INSERT INTO districts (id, name, province_id) VALUES
('burera', 'Burera', 'northern'),
('gakenke', 'Gakenke', 'northern'),
('gicumbi', 'Gicumbi', 'northern'),
('musanze', 'Musanze', 'northern'),
('rulindo', 'Rulindo', 'northern')
ON CONFLICT (id) DO NOTHING;

-- Insert Districts for Southern Province
INSERT INTO districts (id, name, province_id) VALUES
('gisagara', 'Gisagara', 'southern'),
('huye', 'Huye', 'southern'),
('kamonyi', 'Kamonyi', 'southern'),
('muhanga', 'Muhanga', 'southern'),
('nyamagabe', 'Nyamagabe', 'southern'),
('nyanza', 'Nyanza', 'southern'),
('nyaruguru', 'Nyaruguru', 'southern'),
('ruhango', 'Ruhango', 'southern')
ON CONFLICT (id) DO NOTHING;

-- Insert Districts for Western Province
INSERT INTO districts (id, name, province_id) VALUES
('karongi', 'Karongi', 'western'),
('ngororero', 'Ngororero', 'western'),
('nyabihu', 'Nyabihu', 'western'),
('nyamasheke', 'Nyamasheke', 'western'),
('rubavu', 'Rubavu', 'western'),
('rusizi', 'Rusizi', 'western'),
('rutsiro', 'Rutsiro', 'western')
ON CONFLICT (id) DO NOTHING;

-- Insert sectors for Nyagatare district
DELETE FROM sectors WHERE district_id = 'nyagatare';
INSERT INTO sectors (id, name, district_id) VALUES
  ('nyagatare_sector', 'Nyagatare', 'nyagatare'),
  ('rwimiyaga_sector', 'Rwimiyaga', 'nyagatare'),
  ('karama_sector', 'Karama', 'nyagatare'),
  ('rukomo_sector', 'Rukomo', 'nyagatare');

-- Insert cells for Nyagatare sector
INSERT INTO cells (id, name, sector_id) VALUES
  ('barija', 'Barija', 'nyagatare_sector'),
  ('bushoga', 'Bushoga', 'nyagatare_sector'),
  ('cyabayaga', 'Cyabayaga', 'nyagatare_sector'),
  ('gakirage', 'Gakirage', 'nyagatare_sector'),
  ('kamagiri', 'Kamagiri', 'nyagatare_sector'),
  ('nsheke', 'Nsheke', 'nyagatare_sector'),
  ('nyagatare_cell', 'Nyagatare', 'nyagatare_sector'),
  ('rutaraka', 'Rutaraka', 'nyagatare_sector'),
  ('ryabega', 'Ryabega', 'nyagatare_sector');

-- Insert villages for Barija cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('barija_a', 'Barija A', 'barija'),
  ('barija_b', 'Barija B', 'barija'),
  ('burumba', 'Burumba', 'barija'),
  ('kinihira', 'Kinihira', 'barija');

-- Insert villages for Bushoga cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('bushoga_v', 'Bushoga', 'bushoga'),
  ('cyabahanga', 'Cyabahanga', 'bushoga'),
  ('cyonyo', 'Cyonyo', 'bushoga'),
  ('ruhuha_1', 'Ruhuha I', 'bushoga'),
  ('ruhuha_2', 'Ruhuha II', 'bushoga'),
  ('ryinkuyu', 'Ryinkuyu', 'bushoga');

-- Insert villages for Cyabayaga cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('akamonyi', 'Akamonyi', 'cyabayaga'),
  ('bihinga', 'Bihinga', 'cyabayaga'),
  ('cyabayaga_v', 'Cyabayaga', 'cyabayaga'),
  ('nyakabuye', 'Nyakabuye', 'cyabayaga'),
  ('urugero', 'Urugero', 'cyabayaga');

-- Insert villages for Gakirage cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('gakirage_v', 'Gakirage', 'gakirage'),
  ('kiboga_1', 'Kiboga I', 'gakirage'),
  ('kiboga_2', 'Kiboga II', 'gakirage'),
  ('mihingo', 'Mihingo', 'gakirage'),
  ('nkongi', 'Nkongi', 'gakirage'),
  ('urumuri', 'Urumuri', 'gakirage');

-- Insert villages for Kamagiri cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('kamagiri_v', 'Kamagiri', 'kamagiri'),
  ('karungi', 'Karungi', 'kamagiri'),
  ('nkerenke', 'Nkerenke', 'kamagiri');

-- Insert villages for Nsheke cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('kabare', 'Kabare', 'nsheke'),
  ('nsheke_v', 'Nsheke', 'nsheke'),
  ('nyegeza', 'Nyegeza', 'nsheke');

-- Insert villages for Nyagatare cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('mirama_1', 'Mirama I', 'nyagatare_cell'),
  ('mirama_2', 'Mirama II', 'nyagatare_cell'),
  ('nyagatare_1', 'Nyagatare I', 'nyagatare_cell'),
  ('nyagatare_2', 'Nyagatare II', 'nyagatare_cell'),
  ('nyagatare_3', 'Nyagatare III', 'nyagatare_cell');

-- Insert villages for Rutaraka cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('gihorobwa', 'Gihorobwa', 'rutaraka'),
  ('mugari', 'Mugari', 'rutaraka'),
  ('nkonji', 'Nkonji', 'rutaraka'),
  ('rutaraka_v', 'Rutaraka', 'rutaraka'),
  ('ryabega_v', 'Ryabega', 'rutaraka');

-- Insert villages for Ryabega cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('marongero', 'Marongero', 'ryabega'),
  ('rugendo', 'Rugendo', 'ryabega'),
  ('ryabega_v2', 'Ryabega', 'ryabega');

-- Insert cells for Rukomo sector
INSERT INTO cells (id, name, sector_id) VALUES
  ('gahurura', 'Gahurura', 'rukomo_sector'),
  ('gashenyi', 'Gashenyi', 'rukomo_sector'),
  ('nyakagarama', 'Nyakagarama', 'rukomo_sector'),
  ('rukomo_2', 'Rukomo II', 'rukomo_sector'),
  ('rurenge', 'Rurenge', 'rukomo_sector');

-- Insert villages for Gahurura cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('amahoro_g', 'Amahoro', 'gahurura'),
  ('busasamana', 'Busasamana', 'gahurura'),
  ('isangano_g', 'Isangano', 'gahurura'),
  ('nomero_1', 'Nomero I', 'gahurura'),
  ('rambura', 'Rambura', 'gahurura'),
  ('ruyonza', 'Ruyonza', 'gahurura'),
  ('ubumwe', 'Ubumwe', 'gahurura'),
  ('urugwiro', 'Urugwiro', 'gahurura'),
  ('urukundo', 'Urukundo', 'gahurura'),
  ('urumuri_g', 'Urumuri', 'gahurura');

-- Insert villages for Gashenyi cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('agasasa', 'Agasasa', 'gashenyi'),
  ('bukamba', 'Bukamba', 'gashenyi'),
  ('gashenyi_v', 'Gashenyi', 'gashenyi'),
  ('gisenyi_g', 'Gisenyi', 'gashenyi'),
  ('huriro', 'Huriro', 'gashenyi'),
  ('isangano_gs', 'Isangano', 'gashenyi'),
  ('kiyovu', 'Kiyovu', 'gashenyi'),
  ('murore', 'Murore', 'gashenyi'),
  ('nyamirambo_g', 'Nyamirambo', 'gashenyi'),
  ('rebero_g', 'Rebero', 'gashenyi'),
  ('rukomo_v', 'Rukomo', 'gashenyi'),
  ('rurembo', 'Rurembo', 'gashenyi');

-- Insert villages for Nyakagarama cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('akamashama', 'Akamashama', 'nyakagarama'),
  ('akamasheka', 'Akamasheka', 'nyakagarama'),
  ('amahoro_n', 'Amahoro', 'nyakagarama'),
  ('amizero', 'Amizero', 'nyakagarama'),
  ('gashenyi_n', 'Gashenyi', 'nyakagarama'),
  ('gashura', 'Gashura', 'nyakagarama'),
  ('isangano_n', 'Isangano', 'nyakagarama'),
  ('karugondo', 'Karugondo', 'nyakagarama'),
  ('kayenzi', 'Kayenzi', 'nyakagarama'),
  ('musenyi', 'Musenyi', 'nyakagarama'),
  ('nyakagarama_v', 'Nyakagarama', 'nyakagarama'),
  ('nyamworoma', 'Nyamworoma', 'nyakagarama');

-- Insert villages for Rukomo II cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('amahoro_r', 'Amahoro', 'rukomo_2'),
  ('berwa', 'Berwa', 'rukomo_2'),
  ('isangano_r', 'Isangano', 'rukomo_2'),
  ('kabeza_r', 'Kabeza', 'rukomo_2'),
  ('mwurirwa', 'Mwurirwa', 'rukomo_2'),
  ('nyange', 'Nyange', 'rukomo_2'),
  ('nyarubuye', 'Nyarubuye', 'rukomo_2'),
  ('nyarurama', 'Nyarurama', 'rukomo_2'),
  ('rebero_r', 'Rebero', 'rukomo_2'),
  ('rugabano', 'Rugabano', 'rukomo_2');

-- Insert villages for Rurenge cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('akajuka', 'Akajuka', 'rurenge'),
  ('benishyaka', 'Benishyaka', 'rurenge'),
  ('biryogo', 'Biryogo', 'rurenge'),
  ('kabeza_ru', 'Kabeza', 'rurenge'),
  ('kabusunzu', 'Kabusunzu', 'rurenge'),
  ('nyabwunyu', 'Nyabwunyu', 'rurenge'),
  ('nyamirambo_r', 'Nyamirambo', 'rurenge'),
  ('rurenge_v', 'Rurenge', 'rurenge'),
  ('rushashi', 'Rushashi', 'rurenge'),
  ('rwiju', 'Rwiju', 'rurenge');

-- Insert cells for Rwimiyaga sector
INSERT INTO cells (id, name, sector_id) VALUES
  ('gacundezi', 'Gacundezi', 'rwimiyaga_sector'),
  ('kabeza', 'Kabeza', 'rwimiyaga_sector'),
  ('kirebe', 'Kirebe', 'rwimiyaga_sector'),
  ('ntoma', 'Ntoma', 'rwimiyaga_sector'),
  ('nyarupfubire', 'Nyarupfubire', 'rwimiyaga_sector'),
  ('nyendo', 'Nyendo', 'rwimiyaga_sector'),
  ('rutungu', 'Rutungu', 'rwimiyaga_sector'),
  ('rwimiyaga', 'Rwimiyaga', 'rwimiyaga_sector');

-- Insert villages for Gacundezi cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('bugaragara', 'Bugaragara', 'gacundezi'),
  ('gacundezi_1', 'Gacundezi I', 'gacundezi'),
  ('gacundezi_2', 'Gacundezi II', 'gacundezi'),
  ('rukundo_1', 'Rukundo I', 'gacundezi'),
  ('rukundo_2', 'Rukundo II', 'gacundezi'),
  ('rukundo_3', 'Rukundo III', 'gacundezi');

-- Insert villages for Kabeza cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('gatovu', 'Gatovu', 'kabeza'),
  ('kabeza_v', 'Kabeza', 'kabeza'),
  ('kabeza_centre', 'Kabeza Centre', 'kabeza'),
  ('kavumu', 'Kavumu', 'kabeza'),
  ('rugarama', 'Rugarama', 'kabeza'),
  ('rukiri_1', 'Rukiri I', 'kabeza'),
  ('rukiri_2', 'Rukiri II', 'kabeza');

-- Insert villages for Kirebe cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('gatebe_1', 'Gatebe I', 'kirebe'),
  ('gatebe_2', 'Gatebe II', 'kirebe'),
  ('kirebe_v', 'Kirebe', 'kirebe'),
  ('rukindo', 'Rukindo', 'kirebe');

-- Insert villages for Ntoma cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('gashwenu', 'Gashwenu', 'ntoma'),
  ('kibuye', 'Kibuye', 'ntoma'),
  ('kimaramu', 'Kimaramu', 'ntoma'),
  ('nyampire', 'Nyampire', 'ntoma'),
  ('rwembogo', 'Rwembogo', 'ntoma');

-- Insert villages for Nyarupfubire cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('kamagiri_n', 'Kamagiri', 'nyarupfubire'),
  ('nyakagando_1', 'Nyakagando I', 'nyarupfubire'),
  ('nyakagando_2', 'Nyakagando II', 'nyarupfubire'),
  ('nyarupfubire_1', 'Nyarupfubire I', 'nyarupfubire'),
  ('nyarupfubire_2', 'Nyarupfubire II', 'nyarupfubire'),
  ('rwimiyaga_1', 'Rwimiyaga I', 'nyarupfubire'),
  ('rwimiyaga_2', 'Rwimiyaga II', 'nyarupfubire');

-- Insert villages for Nyendo cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('isangano_n', 'Isangano', 'nyendo'),
  ('nyamirama', 'Nyamirama', 'nyendo'),
  ('rebero_n', 'Rebero', 'nyendo'),
  ('remera', 'Remera', 'nyendo');

-- Insert villages for Rutungu cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('bwera', 'Bwera', 'rutungu'),
  ('cyamunyana', 'Cyamunyana', 'rutungu'),
  ('gakagati_1', 'Gakagati I', 'rutungu'),
  ('gakagati_2', 'Gakagati II', 'rutungu'),
  ('rubira', 'Rubira', 'rutungu');

-- Insert villages for Rwimiyaga cell
INSERT INTO villages (id, name, cell_id) VALUES
  ('byimana', 'Byimana', 'rwimiyaga'),
  ('gakoma', 'Gakoma', 'rwimiyaga'),
  ('kizungu', 'Kizungu', 'rwimiyaga'),
  ('mahoro', 'Mahoro', 'rwimiyaga'),
  ('muyange', 'Muyange', 'rwimiyaga'),
  ('rebero', 'Rebero', 'rwimiyaga'),
  ('rwinyange', 'Rwinyange', 'rwimiyaga');
