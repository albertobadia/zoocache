def model_tag(model_or_instance) -> str:
    if hasattr(model_or_instance, "_meta"):
        model = model_or_instance if isinstance(model_or_instance, type) else model_or_instance.__class__
        return f"{model._meta.app_label}.{model._meta.model_name}"
    return str(model_or_instance)


def instance_tag(instance) -> str:
    base = model_tag(instance)
    return f"{base}:{instance.pk}"
