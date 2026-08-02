/*
# Add all 54 African countries

The initial migration only seeded 16 countries. This adds the remaining 38
African countries so the onboarding country selector is complete.
*/

INSERT INTO countries (iso_code, name, region, currency_code, currency_symbol, locale, phone_prefix, flag_emoji)
VALUES
  ('BJ','Benin','West Africa','XOF','CFA','fr','+229','BJ'),
  ('BW','Botswana','Southern Africa','BWP','P','en','+267','BW'),
  ('BF','Burkina Faso','West Africa','XOF','CFA','fr','+226','BF'),
  ('BI','Burundi','East Africa','BIF','FBu','fr','+257','BI'),
  ('CV','Cape Verde','West Africa','CVE','$','pt','+238','CV'),
  ('CF','Central African Republic','Central Africa','XAF','FCFA','fr','+236','CF'),
  ('TD','Chad','Central Africa','XAF','FCFA','fr','+235','TD'),
  ('KM','Comoros','East Africa','KMF','CF','fr','+269','KM'),
  ('CG','Congo','Central Africa','XAF','FCFA','fr','+242','CG'),
  ('CD','DR Congo','Central Africa','CDF','FC','fr','+243','CD'),
  ('DJ','Djibouti','East Africa','DJF','Fdj','fr','+253','DJ'),
  ('GQ','Equatorial Guinea','Central Africa','XAF','FCFA','es','+240','GQ'),
  ('ER','Eritrea','East Africa','ERN','Nfk','en','+291','ER'),
  ('SZ','Eswatini','Southern Africa','SZL','E','en','+268','SZ'),
  ('GA','Gabon','Central Africa','XAF','FCFA','fr','+241','GA'),
  ('GM','Gambia','West Africa','GMD','D','en','+220','GM'),
  ('GN','Guinea','West Africa','GNF','FG','fr','+224','GN'),
  ('GW','Guinea-Bissau','West Africa','XOF','CFA','pt','+245','GW'),
  ('LS','Lesotho','Southern Africa','LSL','L','en','+266','LS'),
  ('LR','Liberia','West Africa','LRD','$','en','+231','LR'),
  ('LY','Libya','North Africa','LYD','LD','ar','+218','LY'),
  ('MG','Madagascar','East Africa','MGA','Ar','fr','+261','MG'),
  ('MW','Malawi','East Africa','MWK','MK','en','+265','MW'),
  ('ML','Mali','West Africa','XOF','CFA','fr','+223','ML'),
  ('MR','Mauritania','West Africa','MRU','UM','ar','+222','MR'),
  ('MU','Mauritius','East Africa','MUR','Rs','en','+230','MU'),
  ('MZ','Mozambique','East Africa','MZN','MT','pt','+258','MZ'),
  ('NA','Namibia','Southern Africa','NAD','$','en','+264','NA'),
  ('NE','Niger','West Africa','XOF','CFA','fr','+227','NE'),
  ('SS','South Sudan','East Africa','SSP','SSP','en','+211','SS'),
  ('ST','Sao Tome and Principe','Central Africa','STN','Db','pt','+239','ST'),
  ('SC','Seychelles','East Africa','SCR','SR','en','+248','SC'),
  ('SL','Sierra Leone','West Africa','SLL','Le','en','+232','SL'),
  ('SO','Somalia','East Africa','SOS','Sh','so','+252','SO'),
  ('SD','Sudan','North Africa','SDG','SDG','ar','+249','SD'),
  ('TG','Togo','West Africa','XOF','CFA','fr','+228','TG'),
  ('ZM','Zambia','Southern Africa','ZMW','ZK','en','+260','ZM'),
  ('ZW','Zimbabwe','Southern Africa','ZWL','$','en','+263','ZW')
ON CONFLICT (iso_code) DO NOTHING;
