from unittest.mock import MagicMock, Mock, patch

from apps.github.models.repository_contributor import RepositoryContributor


class TestRepositoryContributor:
    def test_from_github(self):
        default_contribution_value = 5
        repository_contributor = RepositoryContributor()
        gh_label = Mock(contributions=default_contribution_value)
        repository_contributor.from_github(gh_label)

        assert repository_contributor.contributions_count == default_contribution_value

    def test_bulk_save(self):
        repository_contributors = [Mock(id=None), Mock(id=1)]
        with patch("apps.common.models.BulkSaveModel.bulk_save") as mock_bulk_save:
            RepositoryContributor.bulk_save(repository_contributors)
            mock_bulk_save.assert_called_once_with(RepositoryContributor, repository_contributors)

    def test_update_data(self, mocker):
        gh_contributor = MagicMock()
        gh_contributor.raw_data = {"node_id": "12345"}
        repository = MagicMock()
        user = MagicMock()

        mock_repository_contributor = mocker.Mock(spec=RepositoryContributor)
        mock_repository_contributor.repository = repository
        mock_repository_contributor.user = user
        mocker.patch(
            "apps.github.models.repository_contributor.RepositoryContributor.objects.get",
            return_value=mock_repository_contributor,
        )

        repository_contributor = RepositoryContributor()
        repository_contributor.from_github = mocker.Mock()

        updated_repository_contributor = RepositoryContributor.update_data(
            gh_contributor, repository, user
        )

        assert updated_repository_contributor.repository == mock_repository_contributor.repository
        assert updated_repository_contributor.user == mock_repository_contributor.user
        assert updated_repository_contributor.from_github.call_count == 1