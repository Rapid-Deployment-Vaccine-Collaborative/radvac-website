export type FaqItem = {
  id: string;
  num: string;
  question: string;
  answer: string;
  open?: boolean;
};

export type FaqSectionData = {
  numeral: string;
  label: string;
  items: FaqItem[];
};

export const faqData: FaqSectionData[] = [
  {
    numeral: "I",
    label: "About Radvac",
    items: [
      {
        id: "q1",
        num: "01",
        question: "What is Radvac?",
        answer: `<p>The Rapid Deployment Vaccine Collaborative is an IP-free and open-source vaccine R&amp;D project. We are a group of citizen scientists who are concerned about the staggering costs of the current pandemic (and from possible future pandemics). The death toll is large and growing, but many more who survive the initial infection will suffer serious enduring complications. Our experience in the biomedical sciences allowed us to realize in the early stages of the pandemic that a commercial vaccine would not be widely available through the end of 2020, and during that time the cost in human lives and health would be extremely high; therefore, we mobilized quickly to address this problem. We have used our knowledge and skills in biomedical research to develop SARS-CoV-2 vaccines, which we test on ourselves. We've published our approach in the white paper available for download on this website. We also connect with other professional and citizen scientists who wish to make and deploy the vaccine, to build on our approach, and to advance the sharing of ideas, data, and best practices.</p>`,
      },
      {
        id: "q2",
        num: "02",
        question: "What does Radvac do?",
        answer: `<p>We perform research and development of vaccine formulations that meet 4 minimal criteria:</p><ul><li>General designs are based on decades of published literature demonstrating safety and efficacy in animal models and human trials</li><li>Made from easily obtained and relatively inexpensive materials</li><li>Extremely easy to produce</li><li>Simple and painless to self-administer by nasal sprayer</li></ul><p>Part of our R&amp;D is to test the vaccines on ourselves.</p>`,
      },
      {
        id: "q3",
        num: "03",
        question: "How does this project work?",
        answer: `<p>Radvac initially launched this work and continues to update the design.</p><p>There is however no limitation on other parties modifying and deploying vaccines based on the Radvac platform, and in that sense there is no centralized control. We have modeled Radvac on free and open-source projects that are common in the software industry. Our work is available without restriction except attribution under CC-BY 4.0 and OCL-P v1.1 licenses so that vaccine efforts can spread as efficiently as possible to help people in need. Any individual, non-profit, government, or company is free to use or build on information released by Radvac.</p>`,
      },
      {
        id: "q4",
        num: "04",
        question: "Who is in charge?",
        answer: `<p>Radvac efforts are spearheaded by Preston Estep, Alex Hoekstra, Ranjan Ahuja, and Brian Delaney. We welcome review, participation, and collaboration from everyone, as it is meant to be a decentralized, community-led scientific initiative. You can connect with others in your area to pool efforts and resources, by using the <a href="https://radvac.org/researchers-map/" rel="noopener" target="_blank">Researchers Map</a>.</p>`,
      },
    ],
  },
  {
    numeral: "II",
    label: "The Vaccine",
    items: [
      {
        id: "q5",
        num: "05",
        question: "How is the Radvac vaccine administered?",
        answer: `<p>The vaccines we have used in ourselves are designed to be taken as intranasal sprays. Others might develop alternate approaches as they conduct their own investigations of the scientific literature.</p>`,
      },
      {
        id: "q6",
        num: "06",
        question:
          "What benefits might I get from the Radvac vaccine that I wouldn't get from a commercial vaccine?",
        answer: `<p>Radvac vaccines are complementary to commercial vaccines, and do not preclude the use of other vaccines. Plus, Radvac vaccines provide a few potential advantages over all commercial vaccines in late-stage clinical trials.</p><ul><li>All first-available commercial vaccines are injectable, while Radvac vaccines are delivered by nasal spray. Nasal vaccination can induce a mucosal immune response at the site of viral infection. Injectable vaccines do not induce mucosal immunity, and thus do not prevent infection.</li><li>Even the best commercial vaccines are not 100% effective, meaning they won't work in some people. For example, if you receive a vaccine injection that is 60% effective, this means that 40% of people will not mount an immune response, and will not be well protected from the virus. We believe people should consider the advantages of using more than one vaccine, especially complementary vaccines, to achieve the best chance of protective immunity.</li></ul><p>For additional details on how Radvac's vaccines differ from other vaccines, please see our white paper.</p>`,
      },
      {
        id: "q7",
        num: "07",
        question: "Why self-administration / self-experimentation?",
        answer: `<p>We strongly believe in the principles of individual responsibility, informed consent, open sharing of research results, and minimizing harm. This ethical commitment has informed not only the design of our vaccine, but the design of our experiments. Accordingly, each member of our vaccine development team has made the informed choice to self-administer the vaccine, to generate data which will be used to determine the vaccine's efficacy.</p>`,
      },
    ],
  },
  {
    numeral: "III",
    label: "Safety & Efficacy",
    items: [
      {
        id: "q8",
        num: "08",
        question: "Is the vaccine safe?",
        answer: `<p>Nasal vaccines have been shown in previous studies to be generally very safe, but we cannot guarantee safety.</p><p>In our project, short-term safety has been demonstrated on a small scale for the chitosan and peptide vaccines. We currently use a vaccine design published by Mao and colleagues, which <a href="https://www.science.org/doi/pdf/10.1126/science.abo2523">has been shown</a> to be safe in animal models.</p>`,
      },
      {
        id: "q9",
        num: "09",
        question: "Is the vaccine effective?",
        answer: `<p>Assessing immune response to viral infection is challenging, and assessing response to a vaccine is even more challenging than measuring the response to viral infection. Even large pharmaceutical companies are experiencing delays in commercial releases of their injectable vaccines because assessments of effectiveness are so complex. The vaccines we design and adopt are delivered nasally, and thus is designed to elicit a mucosal immune response at the primary sites of virus entry into the body (nose and lungs). We currently use a vaccine design published by Mao and colleagues, which <a href="https://www.science.org/doi/pdf/10.1126/science.abo2523">has been shown</a> to be effective in animal models, eliciting both T-cell and antibody responses.</p>`,
      },
      {
        id: "q10",
        num: "10",
        question:
          "If the vaccine works, will it give me immunity that can be measured by commercial antibody tests?",
        answer: `<p>Unfortunately, this is a complex issue and there isn't a simple answer. The most common measurement of immunity is an antibody test performed on blood. However, an intranasal vaccine is able to elicit immune responses of various kinds, and even though it might produce a robust and highly protective mucosal immune response, the blood antibody response might not be as pronounced.</p><p>There are two separate immune tissues or systems throughout the body: mucosal immunity and systemic immunity. And there are two separate types of immunity: humoral (B-cell and antibodies) and cellular (T-cells). Although antibody tests are the most common type of immune tests, T-cells are extremely important in controlling and clearing viral infections. Unfortunately, measuring T-cell immunity to a specific virus is much more difficult than measuring antibodies, and these tests are not commonly available. Each tissue or system and each type of immunity might produce immunity, in various combinations. For example, intranasal vaccination of a person might produce robust mucosal antibody and T-cell responses, and a robust systemic (blood) T-cell response, but minimal levels of antibodies in blood.</p>`,
      },
    ],
  },
  {
    numeral: "IV",
    label: "Access & Materials",
    items: [
      {
        id: "q11",
        num: "11",
        question: "How can I buy the vaccine?",
        answer: `<p>All of the reagents, materials, and equipment are commercially available, separately. We currently use a vaccine design <a href="https://www.science.org/doi/pdf/10.1126/science.abo2523">published</a> by Mao and colleagues, which consists of a single component: trimerized Spike protein of SARS-CoV-2. There is no adjuvant or other ingredient, only a liquid carrier for use in an aerosol sprayer.</p>`,
      },
      {
        id: "q12",
        num: "12",
        question: "Can I enroll in a Radvac clinical trial?",
        answer: `<p>Radvac is composed of citizen scientists undertaking only self-experimentation by self-administration. We are not a company, and we also believe that the urgency around COVID-19 calls for a different and open solution, in order to save as many lives as possible. The Radvac team welcomes any new ideas on approaches to measure safety and efficacy of the vaccine as it is being self administered.</p>`,
      },
      {
        id: "q13",
        num: "13",
        question: "Where can I buy the materials to make my own vaccine?",
        answer: `<p>All of the reagents, materials, and equipment we have used thus far are commercially available to purchase. We currently use a vaccine design <a href="https://www.science.org/doi/pdf/10.1126/science.abo2523">published</a> by Mao and colleagues, which consists of a single component: trimerized Spike protein of SARS-CoV-2. Trimerized Spike is commercially available from multiple suppliers. These suppliers can change over time, and variants in circulation might be available from only some but not others. It is best to do a current internet search for the trimerized protein from the variant you need, but make absolutely sure to look for the trimer form since the monomer form will not work.</p><p>In addition, you can connect with others in your area to pool efforts and resources by using the <a href="https://radvac.org/researchers-map/" rel="noopener" target="_blank">Researchers Map</a>.</p>`,
      },
    ],
  },
  {
    numeral: "V",
    label: "Regulation & Posture",
    items: [
      {
        id: "q14",
        num: "14",
        question: "Is this vaccine approved by the FDA?",
        answer: `<p>Our proposed vaccine is for self-experimentation only at this point, since we believe there is a critical and unmet global need for distributed vaccine R&amp;D in response to the COVID-19 pandemic. We are available to advise institutions or governments on their own work using our designs or their modified designs.</p>`,
      },
      {
        id: "q15",
        num: "15",
        question: "Is Radvac anti-FDA?",
        answer: `<p>No, Radvac is not anti-FDA or anti-regulation. On the contrary, we are grateful to the FDA for providing regulation and oversight of the production of safe therapeutics. As professional and citizen scientists, we are filling a desperate need for vaccine R&amp;D, production, and self-administration that are not subject to FDA regulation.</p>`,
      },
      {
        id: "q16",
        num: "16",
        question: "Is Radvac anti-pharma or anti-biotech?",
        answer: `<p>No. Many of us are biotech veterans and currently active in biotech companies. We strongly support the efforts of pharmaceutical and biotech companies to produce commercial vaccines. We also strongly believe in the need for scientific collaboration and open-source tools to address the COVID-19 pandemic, and we have chosen to deinstitutionalize our work in an effort to make these tools accessible to a larger global community as efficiently as possible.</p>`,
      },
    ],
  },
  {
    numeral: "VI",
    label: "Contact",
    items: [
      {
        id: "q17",
        num: "17",
        question: "How do I contact Radvac?",
        answer: `<p>First, please familiarize yourself completely with the information on this website. Then, send us a message <a href="https://radvac.org/contact/">here</a>. Please let us know how you would like to help, and any skills and knowledge you would like to contribute to the effort.</p>`,
      },
    ],
  },
];
