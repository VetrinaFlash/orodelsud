-- Dati iniziali di esempio: catalogo, zone e categorie.
-- ATTENZIONE: prezzi, formati e zone sono indicativi, da sostituire con il listino reale dal pannello (Prodotti → Importa listino).

INSERT INTO zones (name, delivery_days, cutoff_time, lead_days, delivery_fee, free_over, sort) VALUES
 ('Città e dintorni', '1,2,3,4,5,6', '18:00', 1, 0, 0, 1),
 ('Provincia', '2,4', '12:00', 1, 1000, 15000, 2),
 ('Spedizione con corriere (Italia)', '1,3', '12:00', 2, 1500, 30000, 3);

INSERT INTO categories (name, sort) VALUES
 ('Pasta corta al bronzo', 1),
 ('Pasta lunga al bronzo', 2),
 ('Specialità del Sud', 3),
 ('Grani antichi e integrale', 4),
 ('Pasta fresca', 5),
 ('Formati ristorazione', 6);

INSERT INTO products (sku, name, description, category_id, unit, pack, price, vat_rate, min_qty, step_qty, cooking_time, allergens, sort, featured) VALUES
 ('BR-PAC-500', 'Paccheri', 'Il formato simbolo del Sud: tubi larghi e ruvidi, perfetti con ragù, sughi di mare e ripieni al forno.', 1, 'pacco', '500 g', 165, 4, 1, 1, '14 minuti', 'Glutine', 1, 1),
 ('BR-MEZ-500', 'Mezzi paccheri', 'Più piccoli dei paccheri, stessa trafilatura al bronzo: tengono la cottura anche nel servizio.', 1, 'pacco', '500 g', 155, 4, 1, 1, '13 minuti', 'Glutine', 2, 0),
 ('BR-PEN-500', 'Penne rigate', 'Rigatura profonda e superficie porosa che trattiene ogni condimento.', 1, 'pacco', '500 g', 135, 4, 1, 1, '11 minuti', 'Glutine', 3, 0),
 ('BR-RIG-500', 'Rigatoni', 'Grandi e rigati, ideali per sughi corposi e pasta al forno.', 1, 'pacco', '500 g', 135, 4, 1, 1, '13 minuti', 'Glutine', 4, 0),
 ('BR-FUS-500', 'Fusilli', 'La spirale classica, che porta il sugo in ogni giro.', 1, 'pacco', '500 g', 135, 4, 1, 1, '11 minuti', 'Glutine', 5, 0),
 ('BR-CAL-500', 'Calamarata', 'Anelli larghi pensati per i sughi di pesce e il classico calamaro.', 1, 'pacco', '500 g', 165, 4, 1, 1, '14 minuti', 'Glutine', 6, 0),
 ('BR-CON-500', 'Conchiglioni', 'Conchiglie grandi da farcire o da saltare con legumi e verdure.', 1, 'pacco', '500 g', 155, 4, 1, 1, '13 minuti', 'Glutine', 7, 0),
 ('BR-SPA-500', 'Spaghetti', 'Trafilati al bronzo ed essiccati lentamente: ruvidi, corposi, sempre al dente.', 2, 'pacco', '500 g', 135, 4, 1, 1, '11 minuti', 'Glutine', 1, 1),
 ('BR-SPQ-500', 'Spaghettoni', 'Più spessi degli spaghetti, per carbonara, aglio olio e sughi decisi.', 2, 'pacco', '500 g', 145, 4, 1, 1, '13 minuti', 'Glutine', 2, 0),
 ('BR-LIN-500', 'Linguine', 'Il formato del mare: per vongole, scampi e pesto.', 2, 'pacco', '500 g', 145, 4, 1, 1, '10 minuti', 'Glutine', 3, 0),
 ('BR-ZIT-500', 'Ziti lunghi', 'Da spezzare a mano, come nella tradizione delle domeniche del Sud.', 2, 'pacco', '500 g', 165, 4, 1, 1, '14 minuti', 'Glutine', 4, 0),
 ('SUD-FUF-500', 'Fusilli al ferretto', 'Arrotolati come si faceva con il ferro da calza: irregolari e rustici.', 3, 'pacco', '500 g', 225, 4, 1, 1, '15 minuti', 'Glutine', 1, 1),
 ('SUD-CAV-500', 'Cavatelli', 'Piccoli gnocchetti incavati, per cime di rapa, salsiccia e legumi.', 3, 'pacco', '500 g', 195, 4, 1, 1, '13 minuti', 'Glutine', 2, 0),
 ('SUD-ORE-500', 'Orecchiette', 'Di semola, con il centro sottile e il bordo spesso.', 3, 'pacco', '500 g', 195, 4, 1, 1, '12 minuti', 'Glutine', 3, 1),
 ('SUD-BUS-500', 'Busiate', 'Spirali lunghe della tradizione trapanese, ideali con il pesto alla siciliana.', 3, 'pacco', '500 g', 225, 4, 1, 1, '12 minuti', 'Glutine', 4, 0),
 ('SUD-SCI-500', 'Scialatielli', 'Nastri corti e spessi della costiera, per i sughi di mare.', 3, 'pacco', '500 g', 225, 4, 1, 1, '12 minuti', 'Glutine', 5, 0),
 ('GA-CAP-500', 'Spaghetti di Senatore Cappelli', 'Grano duro antico, dal profumo intenso e dalla tenuta eccellente.', 4, 'pacco', '500 g', 275, 4, 1, 1, '10 minuti', 'Glutine', 1, 0),
 ('GA-INT-500', 'Penne integrali', 'Semola integrale di grano duro, ricca di fibre e dal gusto pieno.', 4, 'pacco', '500 g', 185, 4, 1, 1, '11 minuti', 'Glutine', 2, 0),
 ('FR-ORE-KG', 'Orecchiette fresche', 'Fatte a mano su ordinazione. Si conservano 5 giorni in frigorifero.', 5, 'kg', 'vaschetta 1 kg', 650, 4, 1, 0.5, '5 minuti', 'Glutine', 1, 1),
 ('FR-CAV-KG', 'Cavatelli freschi', 'Su ordinazione, consegnati in vaschetta ventilata.', 5, 'kg', 'vaschetta 1 kg', 650, 4, 1, 0.5, '5 minuti', 'Glutine', 2, 0),
 ('FR-FIL-KG', 'Fileja calabresi', 'Maccheroni al ferretto freschi, tipici di Vibo Valentia.', 5, 'kg', 'vaschetta 1 kg', 720, 4, 1, 0.5, '7 minuti', 'Glutine', 3, 0),
 ('FR-RAV-KG', 'Ravioli ricotta e spinaci', 'Sfoglia all''uovo e ripieno di ricotta fresca.', 5, 'kg', 'vassoio 1 kg', 1250, 10, 1, 0.5, '4 minuti', 'Glutine, uova, latte', 4, 0),
 ('FR-GNO-KG', 'Gnocchi di patate', 'Patate, farina e un pizzico di sale. Nient''altro.', 5, 'kg', 'vassoio 1 kg', 590, 10, 1, 0.5, '2 minuti', 'Glutine', 5, 0),
 ('FR-LAS-KG', 'Sfoglia per lasagne', 'Sfoglia fresca all''uovo, già tagliata in fogli.', 5, 'kg', 'vassoio 1 kg', 790, 4, 1, 0.5, 'Al forno', 'Glutine, uova', 6, 0),
 ('HO-SPA-5', 'Spaghetti · sacco ristorazione', 'Formato da cucina professionale, stessa pasta dei pacchi da 500 g.', 6, 'sacco', '5 kg', 1290, 4, 1, 1, '11 minuti', 'Glutine', 1, 1),
 ('HO-PAC-3', 'Paccheri · sacco ristorazione', 'Formato da cucina professionale.', 6, 'sacco', '3 kg', 930, 4, 1, 1, '14 minuti', 'Glutine', 2, 0),
 ('HO-RIG-5', 'Rigatoni · sacco ristorazione', 'Formato da cucina professionale.', 6, 'sacco', '5 kg', 1290, 4, 1, 1, '13 minuti', 'Glutine', 3, 0),
 ('HO-PEN-CT', 'Penne rigate · cartone', 'Cartone da 24 pacchi da 500 g.', 6, 'cartone', '24 × 500 g', 2950, 4, 1, 1, '11 minuti', 'Glutine', 4, 0);
