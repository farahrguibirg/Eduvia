import Chatbot_repository from '../../Repository/Chatbot_repository';
import * as FileSystem from 'expo-file-system';

class ProcessPdfUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(fileUri) {
    try {
      // Vérification de l'existence du fichier
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('Le fichier PDF n\'existe pas');
      }

      // Vérification de la taille du fichier (max 50MB)
      if (fileInfo.size > 50 * 1024 * 1024) {
        throw new Error('Le fichier PDF est trop volumineux (max 50MB)');
      }

      // En mode production, appel API via le repository
      if (process.env.NODE_ENV === 'production') {
        const response = await this.repository.uploadPDF(fileUri);
        return {
          success: true,
          data: response
        };
      } else {
        // En mode développement, simuler une réponse positive
        return {
          success: true,
          data: {
            name: fileUri.split('/').pop(),
            uri: fileUri,
            message: "PDF traité avec succès",
            timestamp: new Date().toISOString()
          }
        };
      }
    } catch (error) {
      console.error('Error in ProcessPdfUseCase:', error);
      throw new Error('Failed to process PDF: ' + error.message);
    }
  }
}

export const processPdfUseCase = new ProcessPdfUseCase(chatRepository);