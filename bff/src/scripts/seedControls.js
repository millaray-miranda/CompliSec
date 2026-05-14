import { query } from '../config/db.js';

const initialControls = [
  {
    control_domain: 'Organizational',
    control_number: '5.1',
    control_name: 'Políticas para la seguridad de la información',
    description: 'La política de seguridad de la información y las políticas específicas del tema deben ser definidas, aprobadas, publicadas y comunicadas a los empleados relevantes.',
    objective: 'Proporcionar dirección y apoyo de la dirección para la seguridad de la información.'
  },
  {
    control_domain: 'People',
    control_number: '6.1',
    control_name: 'Investigación de antecedentes',
    description: 'Las verificaciones de antecedentes de todos los candidatos a empleo deben llevarse a cabo de acuerdo con las leyes y reglamentos pertinentes.',
    objective: 'Asegurar que los empleados son idóneos para los roles que se les consideran.'
  },
  {
    control_domain: 'Physical',
    control_number: '7.1',
    control_name: 'Perímetros de seguridad física',
    description: 'Los perímetros de seguridad deben definirse y usarse para proteger áreas que contienen información e instalaciones de procesamiento de información sensibles o críticas.',
    objective: 'Prevenir el acceso físico no autorizado, daño e interferencia a la información y recursos.'
  },
  {
    control_domain: 'Technological',
    control_number: '8.1',
    control_name: 'Dispositivos de punto final de usuario',
    description: 'La información almacenada en, procesada por o accesible a través de dispositivos de usuario debe ser protegida.',
    objective: 'Proteger la información contra el compromiso resultante del uso de dispositivos de usuario.'
  },
  {
    control_domain: 'Technological',
    control_number: '8.12',
    control_name: 'Prevención de fuga de datos',
    description: 'Las medidas de prevención de fuga de datos deben aplicarse a sistemas, redes y otros dispositivos que procesan, almacenan o transmiten información sensible.',
    objective: 'Detectar y prevenir la divulgación y extracción no autorizada de información.'
  }
];

export const seedControls = async () => {
  try {
    const result = await query('SELECT COUNT(*) FROM annex_a_controls');
    const count = parseInt(result.rows[0].count, 10);
    
    if (count === 0) {
      console.log('Seeding Annex A controls...');
      for (const control of initialControls) {
        await query(
          `INSERT INTO annex_a_controls (control_domain, control_number, control_name, description, objective) 
           VALUES ($1, $2, $3, $4, $5)`,
          [control.control_domain, control.control_number, control.control_name, control.description, control.objective]
        );
      }
      console.log('Annex A controls seeded successfully.');
    } else {
      console.log(`Annex A controls already exist (${count} found). Skipping seed.`);
    }
  } catch (error) {
    console.error('Error seeding controls:', error);
  }
};
