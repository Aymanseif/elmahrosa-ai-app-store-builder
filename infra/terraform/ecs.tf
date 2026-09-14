# ECS Fargate services for web-app, api-core and ai-generator, fronted by an
# ALB. Tasks run in the public subnets with a public IP because there is no
# NAT gateway in this scaffold — Fargate needs internet egress to pull images
# from ECR. Inbound to the tasks themselves is restricted to the ALB security
# group on container ports only (see the services SG in main.tf).

resource "aws_ecr_repository" "web_app" {
  name         = "${var.project_name}/web-app"
  force_delete = true
  tags = {
    Name        = "${var.project_name}/web-app"
    Environment = var.environment
  }
}

resource "aws_ecr_repository" "api_core" {
  name         = "${var.project_name}/api-core"
  force_delete = true
  tags = {
    Name        = "${var.project_name}/api-core"
    Environment = var.environment
  }
}

resource "aws_ecr_repository" "ai_generator" {
  name         = "${var.project_name}/ai-generator"
  force_delete = true
  tags = {
    Name        = "${var.project_name}/ai-generator"
    Environment = var.environment
  }
}

# ---------- IAM ----------

resource "aws_iam_role" "task_execution" {
  name = "${var.project_name}-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      },
    ]
  })

  tags = {
    Name        = "${var.project_name}-ecs-execution-role"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "task_execution" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "task" {
  name = "${var.project_name}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      },
    ]
  })

  tags = {
    Name        = "${var.project_name}-ecs-task-role"
    Environment = var.environment
  }
}

# ---------- Logging ----------

resource "aws_cloudwatch_log_group" "web_app" {
  name              = "/ecs/${var.project_name}/web-app"
  retention_in_days = 14
  tags = {
    Name        = "/ecs/${var.project_name}/web-app"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "api_core" {
  name              = "/ecs/${var.project_name}/api-core"
  retention_in_days = 14
  tags = {
    Name        = "/ecs/${var.project_name}/api-core"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "ai_generator" {
  name              = "/ecs/${var.project_name}/ai-generator"
  retention_in_days = 14
  tags = {
    Name        = "/ecs/${var.project_name}/ai-generator"
    Environment = var.environment
  }
}

# ---------- Task definitions ----------

resource "aws_ecs_task_definition" "web_app" {
  family                   = "${var.project_name}-web-app"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name  = "web-app"
      image = "${aws_ecr_repository.web_app.repository_url}:${var.image_tag}"
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        },
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.web_app.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    },
  ])

  tags = {
    Name        = "${var.project_name}-web-app"
    Environment = var.environment
  }
}

resource "aws_ecs_task_definition" "api_core" {
  family                   = "${var.project_name}-api-core"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name  = "api-core"
      image = "${aws_ecr_repository.api_core.repository_url}:${var.image_tag}"
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        },
      ]
      environment = [
        { name = "PORT", value = "3000" },
        {
          name = "DATABASE_URL"
          # Scaffold note: this interpolates the RDS credentials into the task
          # definition (visible in state). Move to AWS Secrets Manager /
          # SSM SecureString with the container `secrets` block for production.
          value = "postgresql://${aws_db_instance.main.username}:${var.db_password}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}"
        },
        { name = "REDIS_URL", value = "redis://${aws_elasticache_replication_group.main.primary_endpoint_address}:6379" },
        { name = "JWT_SECRET", value = var.jwt_secret },
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.api_core.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    },
  ])

  tags = {
    Name        = "${var.project_name}-api-core"
    Environment = var.environment
  }
}

resource "aws_ecs_task_definition" "ai_generator" {
  family                   = "${var.project_name}-ai-generator"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name  = "ai-generator"
      image = "${aws_ecr_repository.ai_generator.repository_url}:${var.image_tag}"
      portMappings = [
        {
          containerPort = 8000
          protocol      = "tcp"
        },
      ]
      environment = [
        { name = "PORT", value = "8000" },
        { name = "ANTHROPIC_API_KEY", value = var.anthropic_api_key },
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ai_generator.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    },
  ])

  tags = {
    Name        = "${var.project_name}-ai-generator"
    Environment = var.environment
  }
}

# ---------- ACM ----------
# When a domain_name is supplied but no certificate_arn, request and validate a
# cert via DNS so the HTTPS listener below has a certificate to attach. Skip
# both when an existing certificate_arn is given.
resource "aws_acm_certificate" "main" {
  count = var.certificate_arn == "" && var.domain_name != "" ? 1 : 0

  domain_name               = var.domain_name
  validation_method         = "DNS"
  subject_alternative_names = ["*.${var.domain_name}"]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "${var.project_name}-cert"
    Environment = var.environment
  }
}

resource "aws_route53_record" "cert_validation" {
  count = var.certificate_arn == "" && var.domain_name != "" ? 1 : 0

  allow_overwrite = true
  name            = tolist(aws_acm_certificate.main[0].domain_validation_options)[0].resource_record_name
  records         = [tolist(aws_acm_certificate.main[0].domain_validation_options)[0].resource_record_value]
  type            = tolist(aws_acm_certificate.main[0].domain_validation_options)[0].resource_record_type
  zone_id         = var.hosted_zone_id
  ttl             = 60
}

resource "aws_acm_certificate_validation" "main" {
  count = var.certificate_arn == "" && var.domain_name != "" ? 1 : 0

  certificate_arn         = aws_acm_certificate.main[0].arn
  validation_record_fqdns = [aws_route53_record.cert_validation[0].fqdn]
}

# ---------- ALB ----------

resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "Allow HTTP/HTTPS inbound to the load balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-alb-sg"
    Environment = var.environment
  }
}

resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public[0].id, aws_subnet.public[1].id]

  tags = {
    Name        = "${var.project_name}-alb"
    Environment = var.environment
  }
}

resource "aws_lb_target_group" "web_app" {
  name        = "${var.project_name}-web"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 10
    interval            = 30
  }

  tags = {
    Name        = "${var.project_name}-web"
    Environment = var.environment
  }
}

resource "aws_lb_target_group" "api_core" {
  name        = "${var.project_name}-api"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 10
    interval            = 30
  }

  tags = {
    Name        = "${var.project_name}-api"
    Environment = var.environment
  }
}

# HTTPS support: an HTTP->HTTPS redirect listener plus an HTTPS listener that
# forwards to the web-app target group. HTTPS is enabled when either a ready
# ACM certificate ARN is supplied (certificate_arn) or a domain_name is given
# (in which case a cert is requested and DNS-validated above). When HTTPS is
# off, the HTTP listener forwards directly so the scaffold still works in dev.
locals {
  use_https = var.certificate_arn != "" || var.domain_name != ""
  cert_arn  = var.certificate_arn != "" ? var.certificate_arn : try(aws_acm_certificate_validation.main[0].certificate_arn, "")
}

# HTTP listener: forwards when HTTPS is off (dev), redirects to HTTPS when on.
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  dynamic "default_action" {
    for_each = local.use_https ? [1] : []
    content {
      type = "redirect"
      redirect {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }

  dynamic "default_action" {
    for_each = local.use_https ? [] : [1]
    content {
      type             = "forward"
      target_group_arn = aws_lb_target_group.web_app.arn
    }
  }
}

resource "aws_lb_listener" "https" {
  count             = local.use_https ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = local.cert_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web_app.arn
  }
}

resource "aws_lb_listener_rule" "api" {
  listener_arn = local.use_https ? aws_lb_listener.https[0].arn : aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_core.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

# ---------- Services ----------

resource "aws_ecs_service" "web_app" {
  name            = "${var.project_name}-web-app"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.web_app.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public[0].id, aws_subnet.public[1].id]
    security_groups  = [aws_security_group.services.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.web_app.arn
    container_name   = "web-app"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.http]

  tags = {
    Name        = "${var.project_name}-web-app"
    Environment = var.environment
  }
}

resource "aws_ecs_service" "api_core" {
  name            = "${var.project_name}-api-core"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api_core.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public[0].id, aws_subnet.public[1].id]
    security_groups  = [aws_security_group.services.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api_core.arn
    container_name   = "api-core"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.http]

  tags = {
    Name        = "${var.project_name}-api-core"
    Environment = var.environment
  }
}

# Internal worker service: no load balancer attachment. It is invoked by
# api-core (service-to-service) and should not be internet-reachable.
resource "aws_ecs_service" "ai_generator" {
  name            = "${var.project_name}-ai-generator"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.ai_generator.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public[0].id, aws_subnet.public[1].id]
    security_groups  = [aws_security_group.services.id]
    assign_public_ip = true
  }

  tags = {
    Name        = "${var.project_name}-ai-generator"
    Environment = var.environment
  }
}