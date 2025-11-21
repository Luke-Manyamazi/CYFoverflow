import * as repository from "./questionRepository.js";
import logger from "../utils/logger.js";



export const createQuestion = async (userId, title,body, tags, templateType) => {
    if (!title && body) {
      throw new Error("Title is required");
    }
    if(title && !body){
        throw new Error("Content is required");
    }

    return repository.createQuestionDB(title.trim(), body.trim(), tags, templateType, userId);
    
};

export const getAllQuestions = async()=>{
   return repository.getAllQuestionsDB();
}

export const getQuestionById = async(id)=>{
    
        const question = await repository.getQuestionByIdDB(id);
        if(!question){
            logger.error("Error not found Question");
            
        }
        return question;
}

export const updateQuestion = async(userId, id, title, body)=>{
    
        const updated= await repository.getQuestionByIdDB(id);
        if(!updated){
            logger.error( "Question not found");
        }
        if(!title){
            logger.error( "title is required");
        }
        if(!body){
            logger.error( "body is required");
        }
         if(updated.user_id !== userId ){
            logger.error( "You are not authorised to edit");
        }
        return repository.updateQuestionDB(id);
}


export const deleteQuestion = async (id, userId) => {
    const question= await repository.getQuestionByIdDB(id);
    if(!question){
    logger.error("Question not found");
   }
 if(updated.user_id !== userId ){
    logger.error( "You are not authorised to delete");
 }
 return repository.deleteQuestionDB(id);
    
};