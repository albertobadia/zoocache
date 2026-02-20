def model_tag(model_or_instance) -> str:
    """Returns a stable tag for a model class or instance (e.g. 'app.Model')."""
    if hasattr(model_or_instance, "_meta"):
        model = model_or_instance if isinstance(model_or_instance, type) else model_or_instance.__class__
        return f"{model._meta.app_label}.{model._meta.model_name}"
    return str(model_or_instance)


def instance_tag(instance) -> str:
    """Returns a unique tag for a specific instance (e.g. 'app.Model:pk')."""
    base = model_tag(instance)
    return f"{base}:{instance.pk}"
