import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class DuplicatePageDto {
  @IsNotEmpty()
  @IsString()
  pageId: string;

  @IsOptional()
  @IsString()
  spaceId?: string;

  // Conserve le titre d'origine au lieu de le prefixer par « Copy of ».
  // Utilise par la creation de page depuis un modele.
  @IsOptional()
  @IsBoolean()
  keepTitle?: boolean;

  // Rattache la copie a cette page plutot qu'au parent du modele : sert a
  // creer une sous-page depuis un modele.
  @IsOptional()
  @IsString()
  parentPageId?: string;
}

export type CopyPageMapEntry = {
  newPageId: string;
  newSlugId: string;
  oldSlugId: string;
};

export type ICopyPageAttachment = {
  newPageId: string,
  oldPageId: string,
  oldAttachmentId: string,
  newAttachmentId: string,
};
