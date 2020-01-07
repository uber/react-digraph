const defaultQuestionStr = 'generic_yes_no_v2';
const empathyDefaults = {
  phone: {
    lang: 'ES',
    country: 'AR',
  },
  best_match_no_retry: {
    lang: 'ES',
    prediction_data: {
      min_similarity: 90,
      options: {}, // keys will be added for the answer options
    },
  },
  best_match: {
    lang: 'ES',
    prediction_data: {
      min_similarity: 90,
      options: {}, // keys will be added for the answer options
    },
  },
  dates: {
    lang: 'ES',
    country: 'AR',
  },
  prepa: {
    lang: 'ES',
    prediction_data: {
      intent_responses: {
        'prepa-completa': 'Completa',
        'prepa-en-curso': 'En Curso',
        'prepa-sin-inicio': 'No la inicié',
        'prepa-trunca': 'Trunca',
      },
    },
  },
  salary: {
    lang: 'ES',
    country: 'AR',
    prediction_data: {},
  },
  secondary_v2: {
    lang: 'ES',
    prediction_data: {
      intent_responses: {
        secondary_abandoned: 'No lo terminé',
        secondary_finished: 'Terminado',
        secondary_in_progress: 'Lo estoy cursando',
      },
    },
  },
  nickname: {
    lang: 'ES',
    country: 'AR',
  },
  duration: {
    lang: 'ES',
    country: 'AR',
  },
  generic_yes_no_v2: {
    lang: 'ES',
    prediction_data: {
      intent_responses: {
        generic_yes_no_y: 'Si',
        generic_yes_no_n: 'No',
        generic_yes_no_maybe: 'No se',
      },
    },
  },
  welcome_idle: 'welcome_idle',
  interest_v2: {
    lang: 'ES',
    prediction_data: {
      intent_responses: {
        'interest-yes': 'Está OK',
        'interest-no': 'No me interesa',
        'interest-another-time': 'Otro día/fecha',
        'interest-ask-address': 'Está OK',
      },
    },
  },
  schedule_v2: {
    lang: 'ES',
  },
  sentiment: {
    lang: 'ES',
    country: 'AR',
  },
  time_interval: {
    lang: 'ES',
    country: 'AR',
  },
  datetime: {
    lang: 'ES',
    country: 'AR',
  },
};

export { defaultQuestionStr, empathyDefaults };
