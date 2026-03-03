import argparse
import sys
from unittest.mock import MagicMock, patch

import pytest

from zoocache.cli import main, run_cli


def test_cli_main_no_args(capsys):
    with patch.object(sys, "argv", ["zoocache"]):
        with pytest.raises(SystemExit) as exc_info:
            main()
        assert exc_info.value.code == 1


def test_cli_main_help(capsys):
    with patch.object(sys, "argv", ["zoocache", "--help"]):
        with pytest.raises(SystemExit):
            main()
        captured = capsys.readouterr()
        assert "ZooCache" in captured.out or "usage" in captured.out.lower()


def test_run_cli_no_redis_prints_error(capsys):
    args = argparse.Namespace(redis=None, prefix="zoocache")

    with pytest.raises(SystemExit) as exc_info:
        run_cli(args)

    assert exc_info.value.code == 1
    captured = capsys.readouterr()
    assert "Redis URL is required" in captured.err


def test_cli_with_redis_env_var():
    with patch.dict("os.environ", {"REDIS_URL": "redis://localhost:6379"}):
        with patch.object(sys, "argv", ["zoocache", "cli"]):
            with patch("zoocache.cli.run_cli") as mock_run:
                with patch.object(sys, "argv", ["zoocache", "cli"]):
                    main()
                mock_run.assert_called_once()


def test_cli_alias_dashboard():
    with patch.dict("os.environ", {"REDIS_URL": "redis://localhost:6379"}):
        with patch("zoocache.cli.run_cli") as mock_run:
            with patch.object(sys, "argv", ["zoocache", "dashboard"]):
                main()
            mock_run.assert_called_once()


def test_run_cli_with_redis_calls_app():
    args = argparse.Namespace(redis="redis://localhost:6379", prefix="test_prefix")

    with patch("zoocache.tui.app.ZooCacheCLI") as mock_cli_class:
        mock_app = MagicMock()
        mock_cli_class.return_value = mock_app

        run_cli(args)

        mock_cli_class.assert_called_once_with(redis_url="redis://localhost:6379", prefix="test_prefix")
        mock_app.run.assert_called_once()
