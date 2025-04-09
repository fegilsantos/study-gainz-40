
-- This file contains SQL to add 7 new questions for subjectId=2
-- You can run this in the Supabase SQL Editor

-- Question 1
DO $$
DECLARE
  question_id uuid;
BEGIN
  INSERT INTO questions (content, explanation, subject_id, difficulty)
  VALUES (
    'Qual é o principal composto responsável pelo efeito estufa na atmosfera?',
    'O CO2 (dióxido de carbono) é considerado o principal gás de efeito estufa de origem antropogênica, contribuindo significativamente para o aquecimento global através da absorção de radiação infravermelha.',
    2, 
    1
  ) RETURNING id INTO question_id;

  INSERT INTO answers (question_id, content, option_letter, is_correct)
  VALUES 
    (question_id, 'Nitrogênio (N2)', 'A', false),
    (question_id, 'Oxigênio (O2)', 'B', false),
    (question_id, 'Dióxido de Carbono (CO2)', 'C', true),
    (question_id, 'Hidrogênio (H2)', 'D', false);
END $$;

-- Question 2
DO $$
DECLARE
  question_id uuid;
BEGIN
  INSERT INTO questions (content, explanation, subject_id, difficulty)
  VALUES (
    'Qual dos seguintes processos celulares ocorre no citoplasma?',
    'A glicólise é a primeira etapa da respiração celular e ocorre no citoplasma da célula. Neste processo, uma molécula de glicose é dividida em duas moléculas de piruvato, produzindo um pequeno ganho líquido de ATP.',
    2, 
    2
  ) RETURNING id INTO question_id;

  INSERT INTO answers (question_id, content, option_letter, is_correct)
  VALUES 
    (question_id, 'Ciclo de Krebs', 'A', false),
    (question_id, 'Glicólise', 'B', true),
    (question_id, 'Cadeia transportadora de elétrons', 'C', false),
    (question_id, 'Fotossíntese', 'D', false);
END $$;

-- Question 3
DO $$
DECLARE
  question_id uuid;
BEGIN
  INSERT INTO questions (content, explanation, subject_id, difficulty)
  VALUES (
    'Qual das seguintes estruturas celulares é responsável pela síntese de proteínas?',
    'Os ribossomos são organelas celulares responsáveis pela síntese de proteínas. Eles leem o mRNA e traduzem a informação genética em proteínas através do processo de tradução.',
    2, 
    1
  ) RETURNING id INTO question_id;

  INSERT INTO answers (question_id, content, option_letter, is_correct)
  VALUES 
    (question_id, 'Ribossomos', 'A', true),
    (question_id, 'Mitocôndrias', 'B', false),
    (question_id, 'Complexo de Golgi', 'C', false),
    (question_id, 'Lisossomos', 'D', false);
END $$;

-- Question 4
DO $$
DECLARE
  question_id uuid;
BEGIN
  INSERT INTO questions (content, explanation, subject_id, difficulty)
  VALUES (
    'Qual das seguintes enzimas é responsável por desenrolar a dupla hélice do DNA durante a replicação?',
    'A helicase é uma enzima que desenrola a dupla hélice do DNA durante a replicação, quebrando as ligações de hidrogênio entre as bases nitrogenadas complementares para permitir que as enzimas de replicação acessem as fitas individuais.',
    2, 
    3
  ) RETURNING id INTO question_id;

  INSERT INTO answers (question_id, content, option_letter, is_correct)
  VALUES 
    (question_id, 'DNA polimerase', 'A', false),
    (question_id, 'Helicase', 'B', true),
    (question_id, 'Ligase', 'C', false),
    (question_id, 'Topoisomerase', 'D', false);
END $$;

-- Question 5
DO $$
DECLARE
  question_id uuid;
BEGIN
  INSERT INTO questions (content, explanation, subject_id, difficulty, image_path)
  VALUES (
    'Na imagem, qual processo da fotossíntese está sendo representado?',
    'O ciclo de Calvin, também conhecido como fase independente da luz ou fase escura, é a parte da fotossíntese onde o CO2 é fixado e convertido em glicose usando ATP e NADPH produzidos na fase clara.',
    2, 
    2,
    'exercises/ciclo_calvin.jpg'
  ) RETURNING id INTO question_id;

  INSERT INTO answers (question_id, content, option_letter, is_correct)
  VALUES 
    (question_id, 'Fotólise da água', 'A', false),
    (question_id, 'Ciclo de Calvin', 'B', true),
    (question_id, 'Cadeia transportadora de elétrons', 'C', false),
    (question_id, 'Ciclo de Krebs', 'D', false);
END $$;

-- Question 6
DO $$
DECLARE
  question_id uuid;
BEGIN
  INSERT INTO questions (content, explanation, subject_id, difficulty)
  VALUES (
    'Qual é a principal função das mitocôndrias nas células eucarióticas?',
    'As mitocôndrias são frequentemente chamadas de "usinas de energia da célula" porque são responsáveis pela produção da maior parte do ATP celular através da respiração celular aeróbica, especificamente nas etapas do ciclo de Krebs e da cadeia transportadora de elétrons.',
    2, 
    1
  ) RETURNING id INTO question_id;

  INSERT INTO answers (question_id, content, option_letter, is_correct)
  VALUES 
    (question_id, 'Síntese de proteínas', 'A', false),
    (question_id, 'Digestão celular', 'B', false),
    (question_id, 'Produção de energia (ATP)', 'C', true),
    (question_id, 'Armazenamento de lipídios', 'D', false);
END $$;

-- Question 7
DO $$
DECLARE
  question_id uuid;
BEGIN
  INSERT INTO questions (content, explanation, subject_id, difficulty, image_path)
  VALUES (
    'Observe a imagem do cariótipo humano e identifique o que está incorreto:',
    'Um cariótipo humano normal contém 46 cromossomos (23 pares). A trissomia do cromossomo 21 (Síndrome de Down) é caracterizada pela presença de três cópias do cromossomo 21 em vez de duas, resultando em um total de 47 cromossomos.',
    2, 
    3,
    'exercises/cariotipo.jpg'
  ) RETURNING id INTO question_id;

  INSERT INTO answers (question_id, content, option_letter, is_correct)
  VALUES 
    (question_id, 'Presença de cromossomos sexuais XYY', 'A', false),
    (question_id, 'Ausência do cromossomo 13', 'B', false),
    (question_id, 'Trissomia do cromossomo 21', 'C', true),
    (question_id, 'Monossomia do cromossomo 22', 'D', false);
END $$;
