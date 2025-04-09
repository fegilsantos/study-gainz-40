
// This file is for seeding new questions
// Run this using the Supabase SQL Editor

/*
-- Add 7 new questions for subjectId=2

-- Question 1
INSERT INTO questions (content, explanation, subject_id, difficulty)
VALUES (
  'Qual é o principal composto responsável pelo efeito estufa na atmosfera?',
  'O CO2 (dióxido de carbono) é considerado o principal gás de efeito estufa de origem antropogênica, contribuindo significativamente para o aquecimento global através da absorção de radiação infravermelha.',
  2, 
  1
) RETURNING id;

-- For each question returned id, add answers
INSERT INTO answers (question_id, content, option_letter, is_correct)
VALUES 
  ('QUESTION_1_ID', 'Nitrogênio (N2)', 'A', false),
  ('QUESTION_1_ID', 'Oxigênio (O2)', 'B', false),
  ('QUESTION_1_ID', 'Dióxido de Carbono (CO2)', 'C', true),
  ('QUESTION_1_ID', 'Hidrogênio (H2)', 'D', false);

-- Question 2
INSERT INTO questions (content, explanation, subject_id, difficulty)
VALUES (
  'Qual dos seguintes processos celulares ocorre no citoplasma?',
  'A glicólise é a primeira etapa da respiração celular e ocorre no citoplasma da célula. Neste processo, uma molécula de glicose é dividida em duas moléculas de piruvato, produzindo um pequeno ganho líquido de ATP.',
  2, 
  2
) RETURNING id;

INSERT INTO answers (question_id, content, option_letter, is_correct)
VALUES 
  ('QUESTION_2_ID', 'Ciclo de Krebs', 'A', false),
  ('QUESTION_2_ID', 'Glicólise', 'B', true),
  ('QUESTION_2_ID', 'Cadeia transportadora de elétrons', 'C', false),
  ('QUESTION_2_ID', 'Fotossíntese', 'D', false);

-- Question 3
INSERT INTO questions (content, explanation, subject_id, difficulty)
VALUES (
  'Qual das seguintes estruturas celulares é responsável pela síntese de proteínas?',
  'Os ribossomos são organelas celulares responsáveis pela síntese de proteínas. Eles leem o mRNA e traduzem a informação genética em proteínas através do processo de tradução.',
  2, 
  1
) RETURNING id;

INSERT INTO answers (question_id, content, option_letter, is_correct)
VALUES 
  ('QUESTION_3_ID', 'Ribossomos', 'A', true),
  ('QUESTION_3_ID', 'Mitocôndrias', 'B', false),
  ('QUESTION_3_ID', 'Complexo de Golgi', 'C', false),
  ('QUESTION_3_ID', 'Lisossomos', 'D', false);

-- Question 4
INSERT INTO questions (content, explanation, subject_id, difficulty)
VALUES (
  'Qual das seguintes enzimas é responsável por desenrolar a dupla hélice do DNA durante a replicação?',
  'A helicase é uma enzima que desenrola a dupla hélice do DNA durante a replicação, quebrando as ligações de hidrogênio entre as bases nitrogenadas complementares para permitir que as enzimas de replicação acessem as fitas individuais.',
  2, 
  3
) RETURNING id;

INSERT INTO answers (question_id, content, option_letter, is_correct)
VALUES 
  ('QUESTION_4_ID', 'DNA polimerase', 'A', false),
  ('QUESTION_4_ID', 'Helicase', 'B', true),
  ('QUESTION_4_ID', 'Ligase', 'C', false),
  ('QUESTION_4_ID', 'Topoisomerase', 'D', false);

-- Question 5
INSERT INTO questions (content, explanation, subject_id, difficulty, image_path)
VALUES (
  'Na imagem, qual processo da fotossíntese está sendo representado?',
  'O ciclo de Calvin, também conhecido como fase independente da luz ou fase escura, é a parte da fotossíntese onde o CO2 é fixado e convertido em glicose usando ATP e NADPH produzidos na fase clara.',
  2, 
  2,
  'exercises/ciclo_calvin.jpg'
) RETURNING id;

INSERT INTO answers (question_id, content, option_letter, is_correct)
VALUES 
  ('QUESTION_5_ID', 'Fotólise da água', 'A', false),
  ('QUESTION_5_ID', 'Ciclo de Calvin', 'B', true),
  ('QUESTION_5_ID', 'Cadeia transportadora de elétrons', 'C', false),
  ('QUESTION_5_ID', 'Ciclo de Krebs', 'D', false);

-- Question 6
INSERT INTO questions (content, explanation, subject_id, difficulty)
VALUES (
  'Qual é a principal função das mitocôndrias nas células eucarióticas?',
  'As mitocôndrias são frequentemente chamadas de "usinas de energia da célula" porque são responsáveis pela produção da maior parte do ATP celular através da respiração celular aeróbica, especificamente nas etapas do ciclo de Krebs e da cadeia transportadora de elétrons.',
  2, 
  1
) RETURNING id;

INSERT INTO answers (question_id, content, option_letter, is_correct)
VALUES 
  ('QUESTION_6_ID', 'Síntese de proteínas', 'A', false),
  ('QUESTION_6_ID', 'Digestão celular', 'B', false),
  ('QUESTION_6_ID', 'Produção de energia (ATP)', 'C', true),
  ('QUESTION_6_ID', 'Armazenamento de lipídios', 'D', false);

-- Question 7
INSERT INTO questions (content, explanation, subject_id, difficulty, image_path)
VALUES (
  'Observe a imagem do cariótipo humano e identifique o que está incorreto:',
  'Um cariótipo humano normal contém 46 cromossomos (23 pares). A trissomia do cromossomo 21 (Síndrome de Down) é caracterizada pela presença de três cópias do cromossomo 21 em vez de duas, resultando em um total de 47 cromossomos.',
  2, 
  3,
  'exercises/cariotipo.jpg'
) RETURNING id;

INSERT INTO answers (question_id, content, option_letter, is_correct)
VALUES 
  ('QUESTION_7_ID', 'Presença de cromossomos sexuais XYY', 'A', false),
  ('QUESTION_7_ID', 'Ausência do cromossomo 13', 'B', false),
  ('QUESTION_7_ID', 'Trissomia do cromossomo 21', 'C', true),
  ('QUESTION_7_ID', 'Monossomia do cromossomo 22', 'D', false);
*/
