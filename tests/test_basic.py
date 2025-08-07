"""Basic tests."""


def test_sample():
    assert 1 + 1 == 2


def test_import():
    import desktop_tutorial

    assert desktop_tutorial.__version__ == "0.1.0"


def test_module_has_name():
    import desktop_tutorial

    assert hasattr(desktop_tutorial, "__name__")


def test_version_is_string():
    import desktop_tutorial

    assert isinstance(desktop_tutorial.__version__, str)


def test_version_format():
    import desktop_tutorial

    parts = desktop_tutorial.__version__.split(".")
    assert len(parts) == 3
    assert all(part.isdigit() for part in parts)


def test_sample_fail():
    assert 2 * 2 == 4


def test_module_docstring():
    import desktop_tutorial

    assert isinstance(desktop_tutorial.__doc__, str)
    assert len(desktop_tutorial.__doc__) > 0


def test_module_has_attributes():
    import desktop_tutorial

    assert hasattr(desktop_tutorial, "__version__")
    assert hasattr(desktop_tutorial, "__name__")


def test_version_not_empty():
    import desktop_tutorial

    assert desktop_tutorial.__version__ != ""


def test_version_major_nonzero():
    import desktop_tutorial

    major = int(desktop_tutorial.__version__.split(".")[0])
    assert major >= 0


def test_version_minor_and_patch_nonnegative():
    import desktop_tutorial

    minor, patch = map(int, desktop_tutorial.__version__.split(".")[1:])
    assert minor >= 0
    assert patch >= 0


def test_module_type():
    import desktop_tutorial

    assert type(desktop_tutorial).__name__ == "module"


def test_version_starts_with_major():
    import desktop_tutorial

    major = desktop_tutorial.__version__.split(".")[0]
    assert desktop_tutorial.__version__.startswith(major)


def test_version_is_semver():
    import desktop_tutorial
    import re

    assert re.match(r"^\d+\.\d+\.\d+$", desktop_tutorial.__version__)
