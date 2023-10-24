import { inject } from 'inversify';

import { Controller } from '../../core/controller/controller.abstract.js';
import { HttpMethod } from '../../types/http-method.type.js';
import { CommentServiceInterface } from './comment-service.interface.js';
import { AppComponent } from '../../types/app-component.type.js';
import { RentOfferServiceInterface } from '../rent-offer/rent-offer-service.interface.js';
import { LoggerInterface } from '../../core/logger/logger.interface.js';
import { Request, Response } from 'express';
import CreateCommentDto from './dto/create-comment.dto.js';
import HttpError from '../../core/errors/http-error.js';
import { StatusCodes } from 'http-status-codes';
import { fillRDO } from '../../core/utils/common.js';
import CommentRDO from './rdo/comment.rdo.js';

export default class CommentController extends Controller {
  constructor(
    @inject(AppComponent.LoggerInterface) logger: LoggerInterface,
    @inject(AppComponent.CommentServiceInterface) private readonly commentService: CommentServiceInterface,
    @inject(AppComponent.RentOfferServiceInterface) private readonly offerService: RentOfferServiceInterface,
  ) {
    super(logger);

    this.logger.info('Register routes for CommentController…');
    this.addRoute({path: '/', method: HttpMethod.Post, handler: this.create});
  }

  public async create({body}: Request<object, object, CreateCommentDto>, res: Response): Promise<void> {

    if (!await this.offerService.exists(body.offerId)) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Offer with such id ${body.offerId} not exists.`,
        'CommentController'
      );
    }

    const comment = await this.commentService.create(body);
    await this.offerService.incCommentCount(body.offerId);
    this.created(res, fillRDO(CommentRDO, comment));
  }
}
