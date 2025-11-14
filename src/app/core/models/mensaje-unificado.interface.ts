export interface MensajeUnificado {
  id: string;
  tipo: 'chat' | 'alerta' | 'recompensa';
  timestamp: Date;
  leido: boolean; // Para badge de notificaciones
  
  // Si tipo === 'chat'
  texto?: string;
  esIA?: boolean;
  contenido?: string;
  
  // Si tipo === 'alerta'
  titulo?: string;
  subtitulo?: string;
  icono?: string;
  textoBoton?: string;
  severidad?: 'warning' | 'danger' | 'info';
  
  // Si tipo === 'recompensa'
  tituloRecompensa?: string;
  subtituloRecompensa?: string;
  iconoRecompensa?: string;
  imagenRecompensa?: string;
  textoBotonRecompensa?: string;
}

export interface ChatConfig {
  showAlerts: boolean;
  showRewards: boolean;
  showConversations: boolean;
}

export interface RespuestaEstatica {
  respuestaIA: string; // Respuesta que se muestra siempre, sin importar lo que escriba el usuario
}
