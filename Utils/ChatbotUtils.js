// Fonctions utilitaires pour simuler les réponses de l'API
// Ces fonctions sont utilisées en mode développement pour tester l'interface

// Mock responses for PDF-related queries
export const getPdfRelatedResponse = (query, pdfName) => {
    query = query.toLowerCase();
    
    if (query.includes('résumé') || query.includes('résumer') || query.includes('résume')) {
      return `Voici un résumé du document "${pdfName}":\n\nCe document traite principalement des concepts fondamentaux d'apprentissage et présente plusieurs théories éducatives. Il aborde les méthodes d'enseignement moderne et l'intégration de la technologie dans l'éducation.`;
    } 
    else if (query.includes('conclusion') || query.includes('conclut')) {
      return `La conclusion du document "${pdfName}" souligne l'importance de l'apprentissage continu et l'adaptation des méthodes pédagogiques aux besoins individuels des apprenants.`;
    }
    else if (query.includes('auteur') || query.includes('écrit')) {
      return `D'après mon analyse, le document "${pdfName}" a été rédigé par une équipe de chercheurs en sciences de l'éducation, bien que je ne puisse pas identifier précisément les noms des auteurs sans accès à toutes les métadonnées.`;
    }
    else {
      return `Concernant votre question sur le document "${pdfName}", j'analyse actuellement le contenu du PDF pour vous fournir une réponse précise. Comment puis-je vous aider davantage avec ce document ?`;
    }
  };
  
  // Mock responses for general queries
  export const getGeneralResponse = (query) => {
    query = query.toLowerCase();
    
    if (query.includes('bonjour') || query.includes('salut')) {
      return "Bonjour ! Comment puis-je vous aider dans votre apprentissage aujourd'hui ?";
    } 
    else if (query.includes('cours') || query.includes('leçon')) {
      return "Je peux vous aider à comprendre vos cours. De quel sujet souhaitez-vous discuter ? Vous pouvez également télécharger un document PDF pour que je puisse l'analyser.";
    } 
    else if (query.includes('pdf') || query.includes('document')) {
      return "Vous pouvez télécharger un PDF en cliquant sur l'icône + en bas du chat. Je pourrai ensuite analyser son contenu et répondre à vos questions spécifiques.";
    } 
    else {
      return "Merci pour votre question. Pour obtenir des réponses plus précises, essayez de télécharger un document PDF pertinent à votre question, et je pourrai l'analyser pour vous.";
    }
  };