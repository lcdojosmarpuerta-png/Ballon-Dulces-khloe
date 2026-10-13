export interface CompanyInfo {
  name: string;
  shortName: string;
  legalName: string;
  rif: string;
  phone: string;
  phoneFormatted: string;
  address: string;
  slogan: string;
  secondarySlogan?: string;
  instagram: string;
  instagramUrl: string;
  tiktok: string;
  tiktokUrl: string;
  facebook: string;
  facebookUrl: string;
  whatsappNumber: string;
  whatsappUrl: string;
  binancePhone: string;
  binanceUser: string;
  zelleRecipient: string;
}

export const COMPANY_INFO: CompanyInfo = {
  name: 'Emprendimiento Ballón Dulces khloe',
  shortName: 'Ballón Dulces khloe',
  legalName: 'Emprendimiento Ballón Dulces khloe, F.P.',
  rif: 'J-508536371',
  phone: '04145057120',
  phoneFormatted: '0414-5057120',
  address: 'Av.principal de ciudad varyna local Nro 1 sector la ceiba',
  slogan: 'Festejos y Decoraciones',
  secondarySlogan: 'Detalles que marcan la diferencia en tu fiesta',
  instagram: '@ballondulceskhloe02',
  instagramUrl: 'https://instagram.com/ballondulceskhloe02',
  tiktok: '@ballondulceskhloe',
  tiktokUrl: 'https://tiktok.com/@ballondulceskhloe',
  facebook: 'Emprendimiento Ballón Dulces khloe',
  facebookUrl: 'https://facebook.com/ballondulceskhloe',
  whatsappNumber: '584145057120',
  whatsappUrl: 'https://wa.me/584145057120',
  binancePhone: '04145057120',
  binanceUser: 'Morabia18',
  zelleRecipient: 'ReySantaella9122205630',
};

/**
 * Mensaje promocional formateado para enviar a clientes con las redes sociales
 */
export function generateSocialMediaWhatsAppMessage(clientName: string = ''): string {
  const greeting = clientName.trim() ? `¡Hola ${clientName.trim()}! 🎈🍬` : '¡Hola! 🎈🍬';

  return `${greeting}

Te saludamos con mucho cariño desde *${COMPANY_INFO.name}*.

¡Nos encanta ser parte de tus momentos especiales! Te invitamos a seguir nuestras redes sociales para ver nuestros últimos arreglos de globos, mesas de dulces finos, cotillones y promociones exclusivas:

📸 *Instagram:*
${COMPANY_INFO.instagramUrl} (${COMPANY_INFO.instagram})

🎵 *TikTok:*
${COMPANY_INFO.tiktokUrl} (${COMPANY_INFO.tiktok})

📘 *Facebook:*
${COMPANY_INFO.facebook}

📍 *Ubicación:* ${COMPANY_INFO.address}
📞 *Atención directa:* ${COMPANY_INFO.phoneFormatted}
💳 *RIF:* ${COMPANY_INFO.rif}

✨ _"${COMPANY_INFO.slogan}"_ ✨`;
}
