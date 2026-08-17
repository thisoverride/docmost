import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SetTemplateDto {
  @IsNotEmpty()
  @IsString()
  pageId: string;

  @IsNotEmpty()
  @IsBoolean()
  isTemplate: boolean;
}

export class ListTemplatesDto {
  // Espace de destination : sert a ne proposer que les modeles que
  // l'utilisateur peut reellement lire.
  @IsOptional()
  @IsString()
  spaceId?: string;
}
