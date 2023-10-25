import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';

import { CommentServiceInterface } from './comment-service.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import CreateCommentDTO from './dto/create-comment.dto.js';
import { CommentEntity } from './comment.entity.js';
import { SortType } from '../../types/sort-order.type.js';

@injectable()
export default class CommentService implements CommentServiceInterface {
  constructor(
    @inject(AppComponent.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>
  ) {}

  public async create(dto: CreateCommentDTO): Promise<DocumentType<CommentEntity>> {
    const comment = await this.commentModel.create(dto);
    return comment.populate('authorId');
  }

  public async findByOfferId(offerId: string, commentsCount: number): Promise<DocumentType<CommentEntity>[]> {
    return this.commentModel
      .find({offerId})
      .limit(commentsCount)
      .sort({createdAt: SortType.Down})
      .populate('authorId')
      .exec();
  }

  public async deleteByOfferId(offerId: string): Promise<number> {
    return this.commentModel
      .deleteMany({offerId})
      .exec()
      .then((res) => res.deletedCount);
  }
}
