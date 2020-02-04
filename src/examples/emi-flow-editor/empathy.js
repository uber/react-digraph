import { getSimpleItem } from './components/common';

const defaultQuestionStr = 'generic_yes_no_v2';
const empathyDefaults = {
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
  birthdate: {
    lang: 'ES_419',
    country: 'AR',
    prediction_data: {
      intent_responses: {
        skip: 'No responder',
      },
    },
  },
  phone: {
    lang: 'ES',
    country: 'AR',
    prediction_data: {
      intent_responses: {
        dontHave: 'No tengo',
      },
    },
  },
  email: {
    lang: 'ES',
    country: 'AR',
    prediction_data: {
      intent_responses: {
        dontHave: 'No tengo',
      },
    },
  },
  first_name: {
    lang: 'ES_MX',
    country: 'MX',
    prediction_data: {
      intent_responses: {
        dontHave: 'No tengo',
      },
    },
  },
  last_name: {
    lang: 'ES_MX',
    country: 'MX',
    prediction_data: {
      intent_responses: {
        dontHave: 'No tengo',
      },
    },
  },
  geocoder: {
    lang: 'ES',
    country: 'AR',
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
    prediction_data: {
      intent_responses: {},
    },
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

const intentsByQuestionStr = {
  birthdate: ['success', 'skip'],
  phone: ['success', 'dontHave'],
  email: ['success', 'dontHave'],
  first_name: ['success', 'dontHave'],
  last_name: ['success', 'dontHave'],
  dates: ['success'],
  duration: ['didNotWork', 'success'],
  generic_yes_no_v2: [
    'generic_yes_no_n',
    'generic_yes_no_maybe',
    'generic_yes_no_y',
  ],
  interest_v2: [
    'interest-another-time',
    'interest-ask-address',
    'interest-yes',
    'interest-no',
  ],
  nickname: ['success'],
  prepa: [
    'prepa-trunca',
    'prepa-en-curso',
    'prepa-sin-inicio',
    'prepa-completa',
  ],
  salary: ['notSure', 'success'],
  schedule_v2: [
    'userNotInterested',
    'interestCant',
    'otherTime',
    'personalReason',
    'specificTimeAndDay',
    'studying',
    'userConfirms',
    'userDeniesPrediction',
    'confirmsUserInterest',
    'didNotSee',
    'fromDate',
  ],
  secondary_v2: [
    'secondary_abandoned',
    'secondary_in_progress',
    'secondary_finished',
  ],
  sentiment: [
    'Default Fallback Intent',
    'sentiment_happy',
    'sentiment_unhappy',
    'sentiment_neutral',
  ],
};

const faqDefaults = {
  lang: 'ES',
  min_similarity: 90,
  options: {},
  question_str: 'best_match',
};

const deprecatedQuestionStrs = ['best_match'];
const langLabels = ['ES', 'ES_419', 'ES_AR', 'ES_MX'];
const countryLabels = ['MX', 'AR'];
const questionStrItems = Object.keys(empathyDefaults).map(q => {
  const item = getSimpleItem(q);

  if (deprecatedQuestionStrs.includes(q)) {
    item.label += '(deprecated)';
  }

  return item;
});
const langItems = langLabels.map(l => getSimpleItem(l));
const countryItems = countryLabels.map(c => getSimpleItem(c));

export {
  defaultQuestionStr,
  empathyDefaults,
  intentsByQuestionStr,
  questionStrItems,
  langItems,
  countryItems,
  deprecatedQuestionStrs,
  faqDefaults,
};
