import {
  ActionIcon,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { IconFile, IconTemplateOff } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  duplicatePage,
  getTemplates,
  setPageTemplate,
} from "@/features/page/services/page-service.ts";
import { buildPageUrl } from "@/features/page/page.utils.ts";
import { getPageTitle } from "@/features/page/page.utils";
import { IPage } from "@/features/page/types/page.types.ts";
import { queryClient } from "@/main.tsx";

interface TemplatePickerModalProps {
  spaceId: string;
  open: boolean;
  onClose: () => void;
  // Fourni depuis le « + » d'un noeud de l'arbre : la page creee devient
  // alors une sous-page de ce noeud plutot qu'une page racine.
  parentPageId?: string;
}

export default function TemplatePickerModal({
  spaceId,
  open,
  onClose,
  parentPageId,
}: TemplatePickerModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<IPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    getTemplates()
      .then(setTemplates)
      .catch(() =>
        notifications.show({
          message: t("Failed to load templates"),
          color: "red",
        }),
      )
      .finally(() => setLoading(false));
  }, [open, t]);

  // Un modele est une page ordinaire : la creation reutilise la duplication,
  // qui recopie deja sous-pages et pieces jointes. Le drapeau isTemplate
  // n'est pas repris par la copie, la nouvelle page est donc une page normale.
  const handlePick = async (template: IPage) => {
    if (creating) return;
    setCreating(true);

    try {
      const newPage = await duplicatePage({
        pageId: template.id,
        spaceId,
        keepTitle: true,
        parentPageId,
      });

      queryClient.removeQueries({
        predicate: (item) =>
          ["pages", "sidebar-pages", "root-sidebar-pages"].includes(
            item.queryKey[0] as string,
          ),
      });

      navigate(
        buildPageUrl(newPage.space.slug, newPage.slugId, newPage.title),
      );
      onClose();
    } catch (err) {
      notifications.show({
        message: t("Failed to create page from template"),
        color: "red",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleUnmark = async (template: IPage) => {
    try {
      await setPageTemplate({ pageId: template.id, isTemplate: false });
      setTemplates((prev) => prev.filter((item) => item.id !== template.id));
    } catch (err) {
      notifications.show({
        message: t("Failed to remove template"),
        color: "red",
      });
    }
  };

  return (
    <Modal opened={open} onClose={onClose} title={t("New page from template")}>
      {loading ? (
        <Group justify="center" py="md">
          <Loader size="sm" />
        </Group>
      ) : templates.length === 0 ? (
        <Text size="sm" c="dimmed" py="md">
          {t(
            "No template yet. Open a page menu and choose “Save as template”.",
          )}
        </Text>
      ) : (
        <Stack gap="xs">
          {templates.map((template) => (
            <Group key={template.id} justify="space-between" wrap="nowrap">
              <UnstyledButton
                onClick={() => handlePick(template)}
                disabled={creating}
                style={{ flex: 1, minWidth: 0 }}
              >
                <Group gap="xs" wrap="nowrap">
                  <IconFile size={16} />
                  <Text size="sm" truncate>
                    {getPageTitle(template.title, template.isBase, t)}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {template.space?.name}
                  </Text>
                </Group>
              </UnstyledButton>

              <Tooltip label={t("Remove from templates")} withArrow>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => handleUnmark(template)}
                >
                  <IconTemplateOff size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          ))}
        </Stack>
      )}
    </Modal>
  );
}
