export type HelplineResource = {
  name: string;
  phone?: string;
  text?: string;
  link: string;
};

export type WebsiteResource = {
  name: string;
  url: string;
};

export type CountryResources = {
  name: string;
  gambling: {
    helplines: HelplineResource[];
    websites: WebsiteResource[];
  };
  alcohol: {
    helplines: HelplineResource[];
    websites: WebsiteResource[];
  };
  pornography: {
    helplines: HelplineResource[];
    websites: WebsiteResource[];
  };
};

export const countryResources: Record<string, CountryResources> = {
  US: {
    name: 'United States',
    gambling: {
      helplines: [
        { name: 'National Gambling Helpline', phone: '1-800-522-4700', link: 'tel:1-800-522-4700' },
        { name: 'Crisis Text Line', text: 'Text "HELLO" to 741741', link: 'sms:741741&body=HELLO' },
      ],
      websites: [
        { name: 'National Council on Problem Gambling', url: 'https://www.ncpgambling.org' },
        { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
      ],
    },
    alcohol: {
      helplines: [
        { name: 'National AA Helpline', phone: '1-800-839-1686', link: 'tel:1-800-839-1686' },
        { name: 'SAMHSA National Helpline', phone: '1-800-662-4357', link: 'tel:1-800-662-4357' },
      ],
      websites: [
        { name: 'Alcoholics Anonymous', url: 'https://www.aa.org' },
        { name: 'SAMHSA', url: 'https://www.samhsa.gov' },
      ],
    },
    pornography: {
      helplines: [
        { name: 'SAMHSA National Helpline', phone: '1-800-662-4357', link: 'tel:1-800-662-4357' },
        { name: 'Sex Addicts Anonymous', text: 'Visit saa-recovery.org', link: 'https://saa-recovery.org' },
      ],
      websites: [
        { name: 'Fight the New Drug', url: 'https://fightthenewdrug.org' },
        { name: 'NoFap', url: 'https://nofap.com' },
        { name: 'Sex Addicts Anonymous', url: 'https://saa-recovery.org' },
        { name: 'Covenant Eyes', url: 'https://www.covenanteyes.com' },
      ],
    },
  },
  GB: {
    name: 'United Kingdom',
    gambling: {
      helplines: [
        { name: 'National Gambling Helpline', phone: '0808 8020 133', link: 'tel:08088020133' },
        { name: 'GamCare Live Chat', text: 'Visit gamcare.org.uk', link: 'https://www.gamcare.org.uk' },
      ],
      websites: [
        { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
        { name: 'BeGambleAware', url: 'https://www.begambleaware.org' },
        { name: 'Gamblers Anonymous UK', url: 'https://www.gamblersanonymous.org.uk' },
      ],
    },
    alcohol: {
      helplines: [
        { name: 'Drinkline', phone: '0300 123 1110', link: 'tel:03001231110' },
        { name: 'Alcoholics Anonymous UK', phone: '0800 917 7650', link: 'tel:08009177650' },
      ],
      websites: [
        { name: 'Alcoholics Anonymous UK', url: 'https://www.alcoholics-anonymous.org.uk' },
        { name: 'Drinkaware', url: 'https://www.drinkaware.co.uk' },
      ],
    },
    pornography: {
      helplines: [
        { name: 'UKCP Therapy', phone: '020 7014 9955', link: 'tel:02070149955' },
        { name: 'SAA UK', text: 'Visit saa-iso.org', link: 'https://saa-iso.org' },
      ],
      websites: [
        { name: 'Reward Foundation', url: 'https://www.rewardfoundation.org' },
        { name: 'Sex Addiction Help UK', url: 'https://www.sexaddictionhelp.co.uk' },
        { name: 'Fight the New Drug', url: 'https://fightthenewdrug.org' },
      ],
    },
  },
  CA: {
    name: 'Canada',
    gambling: {
      helplines: [
        { name: 'Problem Gambling Helpline', phone: '1-866-531-2600', link: 'tel:1-866-531-2600' },
        { name: 'ConnexOntario (Ontario)', phone: '1-866-531-2600', link: 'tel:1-866-531-2600' },
      ],
      websites: [
        { name: 'Problem Gambling Institute of Ontario', url: 'https://www.problemgambling.ca' },
        { name: 'Responsible Gambling Council', url: 'https://www.responsiblegambling.org' },
      ],
    },
    alcohol: {
      helplines: [
        { name: 'Alcoholics Anonymous Canada', phone: '1-877-870-3260', link: 'tel:1-877-870-3260' },
        { name: 'Drug and Alcohol Helpline', phone: '1-800-565-8603', link: 'tel:1-800-565-8603' },
      ],
      websites: [
        { name: 'AA Canada', url: 'https://aa.org' },
        { name: 'Canadian Centre on Substance Use', url: 'https://www.ccsa.ca' },
      ],
    },
    pornography: {
      helplines: [
        { name: 'Canadian Mental Health Association', phone: '1-833-456-4566', link: 'tel:1-833-456-4566' },
        { name: 'SAA Canada', text: 'Visit saa-recovery.org', link: 'https://saa-recovery.org' },
      ],
      websites: [
        { name: 'Sex Addicts Anonymous', url: 'https://saa-recovery.org' },
        { name: 'Canadian Centre for Addiction', url: 'https://www.ccsa.ca' },
        { name: 'Fight the New Drug', url: 'https://fightthenewdrug.org' },
      ],
    },
  },
  AU: {
    name: 'Australia',
    gambling: {
      helplines: [
        { name: 'National Gambling Helpline', phone: '1800 858 858', link: 'tel:1800858858' },
        { name: 'Gambling Help Online', text: 'Chat available 24/7', link: 'https://www.gamblinghelponline.org.au' },
      ],
      websites: [
        { name: 'Gambling Help Online', url: 'https://www.gamblinghelponline.org.au' },
        { name: 'Gamblers Anonymous Australia', url: 'https://www.gaaustralia.org.au' },
      ],
    },
    alcohol: {
      helplines: [
        { name: 'National Alcohol Helpline', phone: '1800 250 015', link: 'tel:1800250015' },
        { name: 'Alcoholics Anonymous Australia', phone: '1300 222 222', link: 'tel:1300222222' },
      ],
      websites: [
        { name: 'AA Australia', url: 'https://www.aa.org.au' },
        { name: 'Alcohol and Drug Foundation', url: 'https://adf.org.au' },
      ],
    },
    pornography: {
      helplines: [
        { name: 'Lifeline Australia', phone: '13 11 14', link: 'tel:131114' },
        { name: 'SAA Australia', text: 'Visit saa-recovery.org', link: 'https://saa-recovery.org' },
      ],
      websites: [
        { name: 'Reach Out Australia', url: 'https://www.reachout.com' },
        { name: 'Sex Addicts Anonymous', url: 'https://saa-recovery.org' },
        { name: 'Fight the New Drug', url: 'https://fightthenewdrug.org' },
      ],
    },
  },
};

export const DEFAULT_RESOURCES: CountryResources = {
  name: 'International',
  gambling: {
    helplines: [
      { name: 'Gamblers Anonymous', text: 'Visit gamblersamonymous.org', link: 'https://www.gamblersanonymous.org' },
    ],
    websites: [
      { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
      { name: 'International Centre for Gaming Regulation', url: 'https://www.unlv.edu/icgr' },
    ],
  },
  alcohol: {
    helplines: [
      { name: 'Alcoholics Anonymous World Services', text: 'Visit aa.org', link: 'https://www.aa.org' },
    ],
    websites: [
      { name: 'Alcoholics Anonymous', url: 'https://www.aa.org' },
      { name: 'World Health Organization', url: 'https://www.who.int/health-topics/alcohol' },
    ],
  },
  pornography: {
    helplines: [
      { name: 'Sex Addicts Anonymous', text: 'Visit saa-recovery.org', link: 'https://saa-recovery.org' },
    ],
    websites: [
      { name: 'Sex Addicts Anonymous', url: 'https://saa-recovery.org' },
      { name: 'Fight the New Drug', url: 'https://fightthenewdrug.org' },
      { name: 'NoFap', url: 'https://nofap.com' },
      { name: 'Fortify Program', url: 'https://www.joinfortify.com' },
    ],
  },
};
