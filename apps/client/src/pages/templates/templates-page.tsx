import {
  ActionIcon,
  Badge,
  Container,
  Group,
  Menu,
  Table,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconDotsVertical,
  IconFileDescription,
  IconTemplate,
  IconTemplateOff,
  IconTrash,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  deletePage,
  getTemplates,
  setPageTemplate,
} from "@/features/page/services/page-service";
import { useDeletePageModal } from "@/features/page/hooks/use-delete-page-modal";
import { buildPageUrl, getPageTitle } from "@/features/page/page.utils";
import { getSpaceUrl } from "@/lib/config";
import { getInitialsColor } from "@/lib/get-initials-color";
import { formattedDate } from "@/lib/time";
import { EmptyState } from "@/components/ui/empty-state";
import PageListSkeleton from "@/components/ui/page-list-skeleton";
import rowClasses from "@/components/ui/clickable-table-row.module.css";

export default function TemplatesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { openDeleteModal } = useDeletePageModal();

  const {
    data: templates,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["templates"] });

  // Retirer le drapeau rend la page a l'arborescence de son espace : le
  // contenu n'est pas touche, seul son statut de modele change.
  const handleUnmark = async (pageId: string) => {
    try {
      await setPageTemplate({ pageId, isTemplate: false });
      await refresh();
      notifications.show({ message: t("Template moved back to pages") });
    } catch (err) {
      notifications.show({
        message: t("Failed to remove template"),
        color: "red",
      });
    }
  };

  const handleDelete = async (pageId: string) => {
    try {
      await deletePage(pageId);
      await refresh();
      notifications.show({ message: t("Template moved to trash") });
    } catch (err) {
      notifications.show({
        message: t("Failed to delete template"),
        color: "red",
      });
    }
  };

  const title = (
    <Title order={1} size="h3" mb="lg">
      {t("Page templates")}
    </Title>
  );

  if (isLoading) {
    return (
      <Container size={800} py="xl">
        {title}
        <PageListSkeleton />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container size={800} py="xl">
        {title}
        <Text>{t("Failed to load templates")}</Text>
      </Container>
    );
  }

  return (
    <Container size={800} py="xl">
      {title}

      {templates && templates.length > 0 ? (
        <Table.ScrollContainer minWidth={500}>
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Tbody>
              {templates.map((template) => (
                <Table.Tr key={template.id} className={rowClasses.row}>
                  <Table.Td>
                    <UnstyledButton
                      className={rowClasses.link}
                      component={Link}
                      to={buildPageUrl(
                        template.space?.slug,
                        template.slugId,
                        template.title,
                      )}
                    >
                      <Group wrap="nowrap">
                        {template.icon || (
                          <ThemeIcon
                            variant="transparent"
                            color="gray"
                            size={18}
                          >
                            <IconFileDescription size={18} />
                          </ThemeIcon>
                        )}
                        <Text fw={500} size="md" lineClamp={1}>
                          {getPageTitle(template.title, template.isBase, t)}
                        </Text>
                      </Group>
                    </UnstyledButton>
                  </Table.Td>

                  <Table.Td>
                    {template.space && (
                      <Badge
                        color={getInitialsColor(template.space.name)}
                        variant="light"
                        component={Link}
                        to={getSpaceUrl(template.space.slug)}
                        style={{ cursor: "pointer" }}
                      >
                        {template.space.name}
                      </Badge>
                    )}
                  </Table.Td>

                  <Table.Td>
                    <Text
                      c="dimmed"
                      style={{ whiteSpace: "nowrap" }}
                      size="xs"
                      fw={500}
                    >
                      {formattedDate(new Date(template.updatedAt))}
                    </Text>
                  </Table.Td>

                  <Table.Td w={40}>
                    <Menu shadow="md" position="bottom-end" withArrow>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDotsVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconTemplateOff size={16} />}
                          onClick={() => handleUnmark(template.id)}
                        >
                          {t("Remove from templates")}
                        </Menu.Item>

                        <Menu.Divider />

                        <Menu.Item
                          c="red"
                          leftSection={<IconTrash size={16} />}
                          onClick={() =>
                            openDeleteModal({
                              onConfirm: () => handleDelete(template.id),
                            })
                          }
                        >
                          {t("Move to trash")}
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      ) : (
        <EmptyState
          icon={IconTemplate}
          title={t("No page template")}
          description={t(
            "Open a page menu and choose “Save as template” to add one here.",
          )}
        />
      )}
    </Container>
  );
}
