-- Insert Sectors for Gasabo District
INSERT INTO sectors (id, name, district_id) VALUES
('bumbogo', 'Bumbogo', 'gasabo'),
('gatsata', 'Gatsata', 'gasabo'),
('jali', 'Jali', 'gasabo'),
('gikomero', 'Gikomero', 'gasabo'),
('gisozi', 'Gisozi', 'gasabo'),
('jabana', 'Jabana', 'gasabo'),
('kacyiru', 'Kacyiru', 'gasabo'),
('kimihurura', 'Kimihurura', 'gasabo'),
('kimisagara', 'Kimisagara', 'gasabo'),
('kinyinya', 'Kinyinya', 'gasabo'),
('ndera', 'Ndera', 'gasabo'),
('nduba', 'Nduba', 'gasabo'),
('remera', 'Remera', 'gasabo'),
('rusororo', 'Rusororo', 'gasabo'),
('rutunga', 'Rutunga', 'gasabo')
ON CONFLICT (id) DO NOTHING;

-- Insert Sectors for Kicukiro District
INSERT INTO sectors (id, name, district_id) VALUES
('gahanga', 'Gahanga', 'kicukiro'),
('gatenga', 'Gatenga', 'kicukiro'),
('gikondo', 'Gikondo', 'kicukiro'),
('kagarama', 'Kagarama', 'kicukiro'),
('kanombe', 'Kanombe', 'kicukiro'),
('kicukiro_sector', 'Kicukiro', 'kicukiro'),
('niboye', 'Niboye', 'kicukiro')
ON CONFLICT (id) DO NOTHING;

-- Insert Sectors for Nyarugenge District
INSERT INTO sectors (id, name, district_id) VALUES
('gitega', 'Gitega', 'nyarugenge'),
('kanyinya', 'Kanyinya', 'nyarugenge'),
('kigali', 'Kigali', 'nyarugenge'),
('kimisagara_nyarugenge', 'Kimisagara', 'nyarugenge'),
('mageragere', 'Mageragere', 'nyarugenge'),
('muhima', 'Muhima', 'nyarugenge'),
('nyakabanda', 'Nyakabanda', 'nyarugenge'),
('nyamirambo', 'Nyamirambo', 'nyarugenge'),
('rwezamenyo', 'Rwezamenyo', 'nyarugenge')
ON CONFLICT (id) DO NOTHING;

-- Insert some sample Cells for Remera Sector
INSERT INTO cells (id, name, sector_id) VALUES
('remera_cell_1', 'Remera I', 'remera'),
('remera_cell_2', 'Remera II', 'remera'),
('remera_cell_3', 'Remera III', 'remera')
ON CONFLICT (id) DO NOTHING;

-- Insert some sample Cells for Kacyiru Sector
INSERT INTO cells (id, name, sector_id) VALUES
('kacyiru_cell_1', 'Kacyiru I', 'kacyiru'),
('kacyiru_cell_2', 'Kacyiru II', 'kacyiru'),
('kacyiru_cell_3', 'Kacyiru III', 'kacyiru')
ON CONFLICT (id) DO NOTHING;

-- Insert some sample Villages for Remera I Cell
INSERT INTO villages (id, name, cell_id) VALUES
('remera_1_village_1', 'Remera I - Village A', 'remera_cell_1'),
('remera_1_village_2', 'Remera I - Village B', 'remera_cell_1'),
('remera_1_village_3', 'Remera I - Village C', 'remera_cell_1')
ON CONFLICT (id) DO NOTHING;

-- Insert some sample Villages for Kacyiru I Cell
INSERT INTO villages (id, name, cell_id) VALUES
('kacyiru_1_village_1', 'Kacyiru I - Village A', 'kacyiru_cell_1'),
('kacyiru_1_village_2', 'Kacyiru I - Village B', 'kacyiru_cell_1'),
('kacyiru_1_village_3', 'Kacyiru I - Village C', 'kacyiru_cell_1')
ON CONFLICT (id) DO NOTHING;
