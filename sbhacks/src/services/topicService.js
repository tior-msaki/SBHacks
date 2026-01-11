/**
 * Service to generate random debate topics
 */

/**
 * Generate a random topic with hints
 * @returns {Promise<{topic: string, hints: string[]}>}
 */
export async function fetchRandomTopic() {
  // Generate a random topic from our list
  return getRandomTopic();
}

/**
 * Generate a random topic with hints
 * @returns {{topic: string, hints: string[]}}
 */
function getRandomTopic() {
  const topics = [
    {
      topic: "Social media has a positive impact on society",
      hints: [
        "Studies show social media increases connectivity (Harvard Research)",
        "Platforms help small businesses grow (Forbes)",
        "Social media enables rapid information sharing during emergencies (BBC)"
      ]
    },
    {
      topic: "Remote work is more productive than office work",
      hints: [
        "Remote workers report 13% higher productivity (Stanford Study)",
        "Companies save $11,000 per remote employee annually (Global Workplace Analytics)",
        "Remote work reduces commute stress and increases job satisfaction (Gallup)"
      ]
    },
    {
      topic: "Artificial intelligence will create more jobs than it eliminates",
      hints: [
        "AI is expected to create 97 million new jobs by 2025 (World Economic Forum)",
        "Historical precedent: automation has always created new industries (MIT)",
        "AI requires human oversight and maintenance, creating new roles (TechCrunch)"
      ]
    },
    {
      topic: "Pizzas with pineapple are the absolute best!",
      hints: [
        "95% of people in California hate pineapple (Wikipedia)",
        "Last month Bob died from eating pineapply pizza (Fox News)",
        "Everyone in the president's family likes pineapple pizza (Wikipedia)"
      ]
    },
    {
      topic: "Video games cause violence in children",
      hints: [
        "Studies show no direct link between games and real-world violence (American Psychological Association)",
        "Gaming can improve problem-solving skills and hand-eye coordination (Scientific American)",
        "Many countries with high game consumption have low violent crime rates (UN Data)"
      ]
    },
    {
      topic: "Climate change is the most urgent issue facing humanity",
      hints: [
        "Global temperatures have risen 1.1°C since pre-industrial times (NASA)",
        "97% of climate scientists agree human activity is the primary cause (NASA)",
        "Extreme weather events have increased in frequency and intensity (NOAA)"
      ]
    },
    {
      topic: "College education is worth the cost",
      hints: [
        "College graduates earn $1.2 million more over lifetime than high school graduates (Georgetown University)",
        "Unemployment rate for college graduates is 2.2% vs 3.7% for high school graduates (BLS)",
        "College education correlates with better health outcomes and civic engagement (Pew Research)"
      ]
    },
    {
      topic: "Universal basic income should be implemented",
      hints: [
        "Pilot programs show UBI reduces poverty without reducing work motivation (Stanford Basic Income Lab)",
        "UBI could simplify welfare systems and reduce administrative costs (Brookings Institution)",
        "Automation may eliminate many jobs, making UBI necessary (World Economic Forum)"
      ]
    },
    {
      topic: "Standardized testing should be abolished",
      hints: [
        "Tests create stress and don't measure creativity or critical thinking (Education Week)",
        "Standardized tests show bias against minority and low-income students (FairTest)",
        "Many successful countries like Finland have minimal standardized testing (OECD)"
      ]
    },
    {
      topic: "Cryptocurrency is the future of money",
      hints: [
        "Bitcoin has grown from $0.01 to over $60,000 in value (CoinMarketCap)",
        "Blockchain technology enables secure, decentralized transactions (MIT Technology Review)",
        "Major companies like Tesla and PayPal now accept cryptocurrency (Reuters)"
      ]
    },
    {
      topic: "Fast food should be banned in schools",
      hints: [
        "Childhood obesity rates have tripled since 1980 (CDC)",
        "School nutrition programs improve academic performance (Journal of School Health)",
        "Healthy eating habits established in childhood last a lifetime (Harvard School of Public Health)"
      ]
    },
    {
      topic: "Space exploration is worth the cost",
      hints: [
        "NASA's budget is less than 0.5% of federal spending (NASA)",
        "Space technology has led to innovations like GPS and medical imaging (NASA Spinoff)",
        "Exploring space may be necessary for humanity's long-term survival (Scientific American)"
      ]
    },
    {
      topic: "Should artificial intelligence be regulated by governments?",
      hints: [
        "AI systems can perpetuate bias and discrimination (MIT Technology Review)",
        "Regulation could slow innovation and economic growth (Brookings Institution)",
        "Many countries are already implementing AI governance frameworks (EU AI Act)"
      ]
    },
    {
      topic: "Is social media doing more harm than good?",
      hints: [
        "Social media has been linked to increased anxiety and depression (American Psychological Association)",
        "Platforms enable misinformation to spread rapidly (Nature)",
        "Social media connects billions of people and enables social movements (Pew Research)"
      ]
    },
    {
      topic: "Should college education be free?",
      hints: [
        "Student loan debt exceeds $1.7 trillion in the United States (Federal Reserve)",
        "Free college could increase access but may reduce quality (Brookings Institution)",
        "Countries like Germany offer free public university education (OECD)"
      ]
    },
    {
      topic: "Are standardized tests an accurate measure of intelligence?",
      hints: [
        "IQ tests measure specific cognitive abilities, not overall intelligence (Scientific American)",
        "Standardized tests can predict academic success (Educational Testing Service)",
        "Multiple intelligences theory suggests intelligence is multifaceted (Harvard Graduate School of Education)"
      ]
    },
    {
      topic: "Should remote work be the default option?",
      hints: [
        "Remote work can reduce carbon emissions from commuting (Global Workplace Analytics)",
        "In-person collaboration may be more effective for creative work (Harvard Business Review)",
        "Remote work increases access to jobs for people with disabilities (Forbes)"
      ]
    },
    {
      topic: "Is data privacy more important than national security?",
      hints: [
        "Privacy is a fundamental human right (UN Declaration of Human Rights)",
        "Surveillance can prevent terrorist attacks and crime (FBI)",
        "Mass surveillance programs have been found unconstitutional (ACLU)"
      ]
    },
    {
      topic: "Should tech companies be broken up as monopolies?",
      hints: [
        "Large tech companies control vast amounts of data and market share (FTC)",
        "Breaking up companies could reduce innovation and efficiency (Cato Institute)",
        "Antitrust laws exist to prevent market concentration (Department of Justice)"
      ]
    },
    {
      topic: "Is capitalism the best economic system?",
      hints: [
        "Capitalism has lifted billions out of poverty (World Bank)",
        "Capitalism creates wealth inequality and environmental damage (Oxfam)",
        "Mixed economies combine capitalism with social safety nets (IMF)"
      ]
    },
    {
      topic: "Should voting be mandatory?",
      hints: [
        "Mandatory voting increases democratic participation (Australian Electoral Commission)",
        "Forcing people to vote may lead to uninformed choices (Cato Institute)",
        "Countries with mandatory voting have higher voter turnout (International IDEA)"
      ]
    }
  ];

  // Return a random topic
  const randomIndex = Math.floor(Math.random() * topics.length);
  return topics[randomIndex];
}
